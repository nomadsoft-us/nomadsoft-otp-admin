"use client";
import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import AuthPageWrapper from "@/components/auth/auth-page-wrapper";
import GlassmorphismCard from "@/components/auth/glassmorphism-card";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import SignUpStep from "./steps/signup-step";
import IdentityVerificationStep from "./steps/identity-verification-step";
import PhoneVerificationStep from "./steps/phone-verification-step";
import { FileEntity } from "@/services/api/types/file-entity";
import useAuth from "@/services/auth/use-auth";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import CircularProgress from "@mui/material/CircularProgress";

export type OnboardingData = {
  email: string;
  password: string;
  idDocument: FileEntity | null;
  selfie: FileEntity | null;
  phoneNumber: string;
  verificationCode: string;
  token?: string | null;
  refreshToken?: string | null;
  tokenExpires?: number | null;
};

const STEPS = [
  { id: 1, label: "Create Account", component: SignUpStep },
  { id: 2, label: "Verify Identity", component: IdentityVerificationStep },
  { id: 3, label: "Verify Phone", component: PhoneVerificationStep },
];

export default function OnboardingFlow() {
  const { user, verificationStatus, isLoaded, isVerificationLoaded } =
    useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    email: "",
    password: "",
    idDocument: null,
    selfie: null,
    phoneNumber: "",
    verificationCode: "",
  });

  // Check if user is resuming onboarding
  useEffect(() => {
    if (!isLoaded || !isVerificationLoaded) return;

    const tokensInfo = getTokensInfo();
    const hasToken = !!tokensInfo?.token;

    if (hasToken && user) {
      // Check user's verificationStep directly from user object
      if (user.verificationStep === "fully_verified") {
        // User is fully verified, redirect them away from sign-up
        window.location.href = "/admin-panel";
        return;
      }

      // Use verificationStatus for partial users
      if (verificationStatus) {
        if (verificationStatus.currentStep === "email_verified") {
          // Email is verified, move to identity verification
          setCurrentStep(2);
        } else if (verificationStatus.currentStep === "identity_verified") {
          // Identity is verified, move to phone verification
          setCurrentStep(3);
        }
      }

      // Set user email if available
      if (user?.email) {
        setOnboardingData((prev) => ({ ...prev, email: user.email }));
      }
    }

    setIsInitialized(true);
  }, [isLoaded, isVerificationLoaded, user, verificationStatus]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNextStep = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  // Show loading while checking auth status
  if (!isInitialized) {
    return (
      <AuthPageWrapper>
        <Container maxWidth="sm">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading onboarding...
            </Typography>
          </Box>
        </Container>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      <Container maxWidth="sm">
        <GlassmorphismCard
          sx={{
            padding: { xs: 2, sm: 3, md: 4 },
            margin: { xs: 1, sm: 2 },
          }}
        >
          {/* Progress Bar */}
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(0,0,0,0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              Step {currentStep} of {STEPS.length} -{" "}
              {STEPS[currentStep - 1].label}
            </Typography>
          </Box>

          {/* Current Step */}
          <CurrentStepComponent
            data={onboardingData}
            onNext={handleNextStep}
            onBack={currentStep > 1 ? handlePreviousStep : undefined}
          />
        </GlassmorphismCard>
      </Container>
    </AuthPageWrapper>
  );
}
