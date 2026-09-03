// Unit tests for disaster_relief::relief_v3.
//
// NOTE: not executed in the app's build environment (no Sui CLI installed).
// Run with:  cd contracts/relief && sui move test
// The end-to-end scenarios are also exercised against the live testnet contract
// by apps/web/scripts/_e2e_*.mjs — see TESTING.md.

#[test_only]
module disaster_relief::relief_tests {
    use disaster_relief::relief_v3::{Self, AdminCap, RegistrarCap, VerifierCap, HouseholdRegistry,
        DisasterZone, HouseholdRegistration, ReliefTreasury};
    use sui::test_scenario::{Self as ts};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string;

    const ADMIN: address = @0xA1;
    const PPS_OFFICIAL: address = @0xA2;
    const LEADER: address = @0xA3;
    const VERIFIER: address = @0xA4;
    const HOUSEHOLD: address = @0xA5;

    const CODE: vector<u8> = b"MSA-TEST-CODE-0001";

    // Channels
    const CH_PPS: u8 = 0;
    const CH_LEADER: u8 = 1;

    fun postcodes(): vector<string::String> {
        vector[string::utf8(b"43000"), string::utf8(b"43100")]
    }

    /// init module, create a funded treasury and one zone with tier 0 = 500, tier 1 = 2000.
    fun setup(scenario: &mut ts::Scenario, budget_cap: u64, treasury_fund: u64) {
        relief_v3::init_for_testing(scenario.ctx());

        scenario.next_tx(ADMIN);
        {
            let admin = scenario.take_from_sender<AdminCap>();
            let coin = coin::mint_for_testing<SUI>(treasury_fund, scenario.ctx());
            relief_v3::create_treasury<SUI>(&admin, coin, scenario.ctx());
            relief_v3::register_disaster_zone(&admin, b"Kampung Test", postcodes(), budget_cap, scenario.ctx());
            scenario.return_to_sender(admin);
        };

        scenario.next_tx(ADMIN);
        {
            let admin = scenario.take_from_sender<AdminCap>();
            let mut zone = scenario.take_shared<DisasterZone>();
            relief_v3::set_tier_amount(&admin, &mut zone, 0, 500);
            relief_v3::set_tier_amount(&admin, &mut zone, 1, 2000);
            ts::return_shared(zone);
            scenario.return_to_sender(admin);
        };
    }

    fun issue_registrar(scenario: &mut ts::Scenario, to: address, channel: u8) {
        scenario.next_tx(ADMIN);
        let admin = scenario.take_from_sender<AdminCap>();
        relief_v3::issue_registrar_cap(&admin, to, channel, scenario.ctx());
        scenario.return_to_sender(admin);
    }

    fun issue_verifier(scenario: &mut ts::Scenario, to: address) {
        scenario.next_tx(ADMIN);
        let admin = scenario.take_from_sender<AdminCap>();
        relief_v3::issue_verifier_cap(&admin, to, scenario.ctx());
        scenario.return_to_sender(admin);
    }

    fun register(scenario: &mut ts::Scenario, official: address, household_id: vector<u8>, postcode: vector<u8>, tier: u8) {
        scenario.next_tx(official);
        let cap = scenario.take_from_sender<RegistrarCap>();
        let mut registry = scenario.take_shared<HouseholdRegistry>();
        let zone = scenario.take_shared<DisasterZone>();
        let code_hash = std::hash::sha3_256(CODE);
        relief_v3::register_household(&cap, &mut registry, &zone, household_id, code_hash, postcode, tier, scenario.ctx());
        ts::return_shared(zone);
        ts::return_shared(registry);
        scenario.return_to_sender(cap);
    }

    // ---------------------------------------------------------------------

    #[test]
    fun test_full_happy_path() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, PPS_OFFICIAL, CH_PPS);
        register(&mut scenario, PPS_OFFICIAL, b"HH-1", b"43000", 1);

        // PPS auto-verifies.
        scenario.next_tx(HOUSEHOLD);
        {
            let reg = scenario.take_shared<HouseholdRegistration>();
            assert!(relief_v3::registration_status(&reg) == relief_v3::status_verified(), 100);
            ts::return_shared(reg);
        };

        // Household claims with the correct code.
        scenario.next_tx(HOUSEHOLD);
        {
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::claim_and_link(&mut reg, CODE, scenario.ctx());
            assert!(relief_v3::registration_claimed(&reg), 101);
            ts::return_shared(reg);
        };

        // Release funds — household receives tier 1 (2000).
        scenario.next_tx(HOUSEHOLD);
        {
            let mut treasury = scenario.take_shared<ReliefTreasury<SUI>>();
            let mut zone = scenario.take_shared<DisasterZone>();
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::release_funds<SUI>(&mut treasury, &mut zone, &mut reg, scenario.ctx());
            assert!(relief_v3::registration_status(&reg) == relief_v3::status_paid(), 102);
            assert!(relief_v3::zone_budget_spent(&zone) == 2000, 103);
            ts::return_shared(reg);
            ts::return_shared(zone);
            ts::return_shared(treasury);
        };

        scenario.next_tx(HOUSEHOLD);
        {
            let paid = scenario.take_from_sender<Coin<SUI>>();
            assert!(coin::value(&paid) == 2000, 104);
            scenario.return_to_sender(paid);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_community_leader_stays_pending_then_verified() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, LEADER, CH_LEADER);
        issue_verifier(&mut scenario, VERIFIER);
        register(&mut scenario, LEADER, b"HH-2", b"43100", 0);

        scenario.next_tx(VERIFIER);
        {
            let reg = scenario.take_shared<HouseholdRegistration>();
            assert!(relief_v3::registration_status(&reg) == relief_v3::status_pending(), 200);
            ts::return_shared(reg);
        };

        scenario.next_tx(VERIFIER);
        {
            let cap = scenario.take_from_sender<VerifierCap>();
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::verify_registration(&cap, &mut reg);
            assert!(relief_v3::registration_status(&reg) == relief_v3::status_verified(), 201);
            ts::return_shared(reg);
            scenario.return_to_sender(cap);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1)]
    fun test_duplicate_household_rejected_at_registration() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, PPS_OFFICIAL, CH_PPS);
        register(&mut scenario, PPS_OFFICIAL, b"HH-DUP", b"43000", 0);
        register(&mut scenario, PPS_OFFICIAL, b"HH-DUP", b"43000", 0); // aborts here
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 3)]
    fun test_ineligible_postcode_rejected() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, PPS_OFFICIAL, CH_PPS);
        register(&mut scenario, PPS_OFFICIAL, b"HH-3", b"99999", 0); // aborts here
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 8)]
    fun test_wrong_reference_code_rejected() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, PPS_OFFICIAL, CH_PPS);
        register(&mut scenario, PPS_OFFICIAL, b"HH-4", b"43000", 0);

        scenario.next_tx(HOUSEHOLD);
        let mut reg = scenario.take_shared<HouseholdRegistration>();
        relief_v3::claim_and_link(&mut reg, b"WRONG-CODE", scenario.ctx()); // aborts here
        ts::return_shared(reg);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 4)]
    fun test_claim_before_verified_rejected() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, LEADER, CH_LEADER);
        register(&mut scenario, LEADER, b"HH-5", b"43000", 0); // pending

        scenario.next_tx(HOUSEHOLD);
        let mut reg = scenario.take_shared<HouseholdRegistration>();
        relief_v3::claim_and_link(&mut reg, CODE, scenario.ctx()); // aborts here
        ts::return_shared(reg);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 6)]
    fun test_budget_cap_enforced() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 1_000, 1_000_000); // cap below tier 1 (2000)
        issue_registrar(&mut scenario, PPS_OFFICIAL, CH_PPS);
        register(&mut scenario, PPS_OFFICIAL, b"HH-6", b"43000", 1);

        scenario.next_tx(HOUSEHOLD);
        {
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::claim_and_link(&mut reg, CODE, scenario.ctx());
            ts::return_shared(reg);
        };

        scenario.next_tx(HOUSEHOLD);
        let mut treasury = scenario.take_shared<ReliefTreasury<SUI>>();
        let mut zone = scenario.take_shared<DisasterZone>();
        let mut reg = scenario.take_shared<HouseholdRegistration>();
        relief_v3::release_funds<SUI>(&mut treasury, &mut zone, &mut reg, scenario.ctx()); // aborts here
        ts::return_shared(reg);
        ts::return_shared(zone);
        ts::return_shared(treasury);
        ts::end(scenario);
    }

    #[test]
    fun test_rejected_household_can_reregister() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);
        issue_registrar(&mut scenario, LEADER, CH_LEADER);
        issue_verifier(&mut scenario, VERIFIER);
        register(&mut scenario, LEADER, b"HH-7", b"43000", 0);

        scenario.next_tx(VERIFIER);
        {
            let cap = scenario.take_from_sender<VerifierCap>();
            let mut registry = scenario.take_shared<HouseholdRegistry>();
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::reject_registration(&cap, &mut registry, &mut reg, b"bad data");
            ts::return_shared(reg);
            ts::return_shared(registry);
            scenario.return_to_sender(cap);
        };

        // Same household_id can be registered again after rejection.
        register(&mut scenario, LEADER, b"HH-7", b"43100", 1);
        ts::end(scenario);
    }

    #[test]
    fun test_set_tier_amount_overwrites_existing() {
        let mut scenario = ts::begin(ADMIN);
        setup(&mut scenario, 10_000, 1_000_000);

        scenario.next_tx(ADMIN);
        {
            let admin = scenario.take_from_sender<AdminCap>();
            let mut zone = scenario.take_shared<DisasterZone>();
            relief_v3::set_tier_amount(&admin, &mut zone, 0, 750); // was 500
            ts::return_shared(zone);
            scenario.return_to_sender(admin);
        };

        issue_registrar(&mut scenario, PPS_OFFICIAL, CH_PPS);
        register(&mut scenario, PPS_OFFICIAL, b"HH-8", b"43000", 0);

        scenario.next_tx(HOUSEHOLD);
        {
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::claim_and_link(&mut reg, CODE, scenario.ctx());
            ts::return_shared(reg);
        };

        scenario.next_tx(HOUSEHOLD);
        {
            let mut treasury = scenario.take_shared<ReliefTreasury<SUI>>();
            let mut zone = scenario.take_shared<DisasterZone>();
            let mut reg = scenario.take_shared<HouseholdRegistration>();
            relief_v3::release_funds<SUI>(&mut treasury, &mut zone, &mut reg, scenario.ctx());
            assert!(relief_v3::zone_budget_spent(&zone) == 750, 800);
            ts::return_shared(reg);
            ts::return_shared(zone);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }
}
