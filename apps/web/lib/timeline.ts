import type { TimelineStep } from "@/components/StepTimeline";
import { formatDateTime } from "@/lib/format";
import { RegistrationStatus, type HouseholdRegistration } from "@/lib/types";

/** Registered -> Verified -> Claimed -> Paid, derived from a registration's state. */
export function registrationSteps(reg: HouseholdRegistration): TimelineStep[] {
  const rejected = reg.status === RegistrationStatus.Rejected;
  const paid = reg.status === RegistrationStatus.Paid;
  const verified = reg.status === RegistrationStatus.Verified || paid;
  return [
    {
      key: "registered",
      label: "Registered by an official",
      detail: formatDateTime(reg.createdAt),
      state: "done",
    },
    {
      key: "verified",
      label: rejected ? "Registration rejected" : "Verified",
      detail: rejected ? "Please re-verify in person" : undefined,
      state: rejected ? "skipped" : verified ? "done" : "current",
    },
    {
      key: "claimed",
      label: "Linked to your account",
      state: reg.claimed ? "done" : rejected ? "skipped" : verified ? "current" : "upcoming",
    },
    {
      key: "paid",
      label: "Aid received",
      state: paid ? "done" : rejected ? "skipped" : reg.claimed ? "current" : "upcoming",
    },
  ];
}
