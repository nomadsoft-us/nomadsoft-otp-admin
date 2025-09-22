"use client";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

// No auth wrapper - this page handles both new signups and partial users resuming onboarding
export default function SignUp() {
  return <OnboardingFlow />;
}
