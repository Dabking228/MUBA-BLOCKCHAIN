/// Disaster Relief Aid Distribution — v3
///
/// Change from v2: a household's account doesn't exist yet at registration
/// time (zkLogin addresses are only derived when someone actually logs in).
/// So register_household no longer takes an address at all — it stores a
/// hash of a physical reference code instead. When the household regains
/// connectivity and logs in via zkLogin, they call claim_and_link themselves,
/// presenting the code, which binds their own freshly-derived address to the
/// registration. No official or admin key is ever capable of setting a
/// household's payout address.
///
/// This also means HouseholdRegistration must be a SHARED object, not owned
/// by the registrar as in v2 — the household needs to be able to reference
/// and mutate it in their own claim_and_link transaction, which only works
/// on shared objects.
module disaster_relief::relief_v3 {

    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use std::hash;

    // ===== Error codes =====
    const E_ALREADY_REGISTERED: u64 = 1;
    const E_ZONE_NOT_ACTIVE: u64 = 2;
    const E_POSTCODE_NOT_ELIGIBLE: u64 = 3;
    const E_NOT_VERIFIED: u64 = 4;
    const E_TIER_NOT_SET: u64 = 5;
    const E_BUDGET_EXCEEDED: u64 = 6;
    const E_ALREADY_CLAIMED: u64 = 7;
    const E_INVALID_CODE: u64 = 8;
    const E_NOT_CLAIMED_YET: u64 = 9;
    const E_ZONE_MISMATCH: u64 = 10;

    // ===== Registration status =====
    const STATUS_PENDING: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;
    const STATUS_PAID: u8 = 3;

    // ===== Registration channel =====
    const CHANNEL_PPS: u8 = 0;
    const CHANNEL_COMMUNITY_LEADER: u8 = 1;
    const CHANNEL_DISTRICT_OFFICE: u8 = 2;

    // ===== Capabilities =====

    public struct AdminCap has key, store { id: UID }

    public struct RegistrarCap has key, store { id: UID, channel: u8 }

    public struct VerifierCap has key, store { id: UID }

    // ===== Shared objects =====

    public struct ReliefTreasury<phantom T> has key {
        id: UID,
        balance: Balance<T>,
    }

    public struct HouseholdRegistry has key {
        id: UID,
        registered_households: Table<String, bool>,
    }

    public struct DisasterZone has key, store {
        id: UID,
        name: String,
        active: bool,
        eligible_postcodes: vector<String>,
        tier_amounts: Table<u8, u64>,
        budget_cap: u64,
        budget_spent: u64,
    }

    /// Now a SHARED object (see module note above). head_of_household stays
    /// None until the household themselves calls claim_and_link.
    public struct HouseholdRegistration has key {
        id: UID,
        head_of_household: Option<address>,
        reference_code_hash: vector<u8>,
        claimed: bool,
        household_id: String,
        zone_id: ID,
        postcode: String,
        channel: u8,
        tier: u8,
        status: u8,
        registrar: address,
    }

    // ===== Events =====

    public struct RegistrationSubmitted has copy, drop {
        registration_id: ID, household_id: String, channel: u8, registrar: address
    }
    public struct RegistrationVerified has copy, drop { registration_id: ID }
    public struct RegistrationRejected has copy, drop { registration_id: ID, reason: String }
    public struct HouseholdLinked has copy, drop { registration_id: ID, head_of_household: address }
    public struct AidPaid has copy, drop { registration_id: ID, head_of_household: address, amount: u64 }
    public struct Donated has copy, drop { donor: address, amount: u64 }

    // ===== Setup =====

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        let registry = HouseholdRegistry { id: object::new(ctx), registered_households: table::new(ctx) };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(registry);
    }

    public entry fun create_treasury<T>(_admin: &AdminCap, initial: Coin<T>, ctx: &mut TxContext) {
        let treasury = ReliefTreasury<T> { id: object::new(ctx), balance: coin::into_balance(initial) };
        transfer::share_object(treasury);
    }

    public entry fun donate<T>(treasury: &mut ReliefTreasury<T>, donation: Coin<T>, ctx: &TxContext) {
        let amount = coin::value(&donation);
        balance::join(&mut treasury.balance, coin::into_balance(donation));
        event::emit(Donated { donor: tx_context::sender(ctx), amount });
    }

    public entry fun register_disaster_zone(
        _admin: &AdminCap,
        name: vector<u8>,
        eligible_postcodes: vector<String>,
        budget_cap: u64,
        ctx: &mut TxContext
    ) {
        let zone = DisasterZone {
            id: object::new(ctx),
            name: string::utf8(name),
            active: true,
            eligible_postcodes,
            tier_amounts: table::new(ctx),
            budget_cap,
            budget_spent: 0,
        };
        transfer::share_object(zone);
    }

    public entry fun set_tier_amount(_admin: &AdminCap, zone: &mut DisasterZone, tier: u8, amount: u64) {
        if (table::contains(&zone.tier_amounts, tier)) {
            *table::borrow_mut(&mut zone.tier_amounts, tier) = amount;
        } else {
            table::add(&mut zone.tier_amounts, tier, amount);
        };
    }

    public entry fun issue_registrar_cap(_admin: &AdminCap, to: address, channel: u8, ctx: &mut TxContext) {
        let cap = RegistrarCap { id: object::new(ctx), channel };
        transfer::transfer(cap, to);
    }

    public entry fun issue_verifier_cap(_admin: &AdminCap, to: address, ctx: &mut TxContext) {
        let cap = VerifierCap { id: object::new(ctx) };
        transfer::transfer(cap, to);
    }

    // ===== Registration =====

    /// reference_code_hash is computed off-chain (sha3-256 of a randomly
    /// generated code) by the app before this call. The plaintext code is
    /// printed on a physical slip for the household and never touches the
    /// chain — only its hash does.
    public entry fun register_household(
        cap: &RegistrarCap,
        registry: &mut HouseholdRegistry,
        zone: &DisasterZone,
        household_id: vector<u8>,
        reference_code_hash: vector<u8>,
        postcode: vector<u8>,
        tier: u8,
        ctx: &mut TxContext
    ) {
        assert!(zone.active, E_ZONE_NOT_ACTIVE);
        let postcode_str = string::utf8(postcode);
        assert!(vector::contains(&zone.eligible_postcodes, &postcode_str), E_POSTCODE_NOT_ELIGIBLE);

        let household_str = string::utf8(household_id);
        assert!(!table::contains(&registry.registered_households, household_str), E_ALREADY_REGISTERED);

        // Reserve the household_id now, not at payout — this is what actually
        // closes the window where two registrations for the same household
        // could otherwise both exist before either is paid.
        table::add(&mut registry.registered_households, household_str, true);

        let initial_status = if (cap.channel == CHANNEL_COMMUNITY_LEADER) {
            STATUS_PENDING
        } else {
            STATUS_VERIFIED
        };

        let registration = HouseholdRegistration {
            id: object::new(ctx),
            head_of_household: option::none(),
            reference_code_hash,
            claimed: false,
            household_id: household_str,
            zone_id: object::id(zone),
            postcode: postcode_str,
            channel: cap.channel,
            tier,
            status: initial_status,
            registrar: tx_context::sender(ctx),
        };

        event::emit(RegistrationSubmitted {
            registration_id: object::id(&registration),
            household_id: registration.household_id,
            channel: registration.channel,
            registrar: registration.registrar,
        });

        // Shared, not transferred — the household needs to reference this
        // object themselves later, in their own claim_and_link transaction.
        transfer::share_object(registration);
    }

    // ===== Independent verification =====

    public entry fun verify_registration(_verifier: &VerifierCap, registration: &mut HouseholdRegistration) {
        registration.status = STATUS_VERIFIED;
        event::emit(RegistrationVerified { registration_id: object::id(registration) });
    }

    public entry fun reject_registration(
        _verifier: &VerifierCap,
        registry: &mut HouseholdRegistry,
        registration: &mut HouseholdRegistration,
        reason: vector<u8>
    ) {
        registration.status = STATUS_REJECTED;
        // Release the household_id so a corrected registration can be
        // submitted later — a rejection should block a bad submission,
        // not permanently lock the household out.
        let _ = table::remove(&mut registry.registered_households, registration.household_id);
        event::emit(RegistrationRejected { registration_id: object::id(registration), reason: string::utf8(reason) });
    }

    public entry fun admin_override_verify(_admin: &AdminCap, registration: &mut HouseholdRegistration) {
        registration.status = STATUS_VERIFIED;
        event::emit(RegistrationVerified { registration_id: object::id(registration) });
    }

    // ===== Household claims their own registration =====

    /// Called by the Head of Household themselves, signed with their own
    /// zkLogin-derived address — this is the only place that address gets
    /// set, and it's always the caller's own address, never one supplied by
    /// an official or admin.
    public entry fun claim_and_link(registration: &mut HouseholdRegistration, code: vector<u8>, ctx: &mut TxContext) {
        assert!(registration.status == STATUS_VERIFIED, E_NOT_VERIFIED);
        assert!(!registration.claimed, E_ALREADY_CLAIMED);
        assert!(hash::sha3_256(code) == registration.reference_code_hash, E_INVALID_CODE);

        let sender = tx_context::sender(ctx);
        registration.head_of_household = option::some(sender);
        registration.claimed = true;

        event::emit(HouseholdLinked { registration_id: object::id(registration), head_of_household: sender });
    }

    // ===== Payout =====

    public entry fun release_funds<T>(
        treasury: &mut ReliefTreasury<T>,
        zone: &mut DisasterZone,
        registration: &mut HouseholdRegistration,
        ctx: &mut TxContext
    ) {
        assert!(registration.claimed, E_NOT_CLAIMED_YET);
        assert!(registration.status == STATUS_VERIFIED, E_NOT_VERIFIED);
        assert!(registration.zone_id == object::id(zone), E_ZONE_MISMATCH);
        assert!(table::contains(&zone.tier_amounts, registration.tier), E_TIER_NOT_SET);

        let amount = *table::borrow(&zone.tier_amounts, registration.tier);
        assert!(zone.budget_spent + amount <= zone.budget_cap, E_BUDGET_EXCEEDED);

        zone.budget_spent = zone.budget_spent + amount;

        let recipient = *option::borrow(&registration.head_of_household);
        let payout = coin::take(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(payout, recipient);

        registration.status = STATUS_PAID;
        event::emit(AidPaid { registration_id: object::id(registration), head_of_household: recipient, amount });
    }

    // ===== Test-only helpers =====
    // Stripped from published bytecode; no redeploy needed to add these.

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test_only]
    public fun registration_status(r: &HouseholdRegistration): u8 { r.status }

    #[test_only]
    public fun registration_claimed(r: &HouseholdRegistration): bool { r.claimed }

    #[test_only]
    public fun zone_budget_spent(z: &DisasterZone): u64 { z.budget_spent }

    #[test_only]
    public fun treasury_balance<T>(t: &ReliefTreasury<T>): u64 { balance::value(&t.balance) }

    #[test_only]
    public fun status_verified(): u8 { STATUS_VERIFIED }

    #[test_only]
    public fun status_pending(): u8 { STATUS_PENDING }

    #[test_only]
    public fun status_paid(): u8 { STATUS_PAID }
}
