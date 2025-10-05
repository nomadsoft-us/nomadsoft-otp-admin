"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { useForm, FormProvider } from "react-hook-form";
import {
  useAuthPhoneInitiateService,
  useAuthPhoneVerifyService,
} from "@/services/api/services/auth";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useColorScheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { OnboardingData } from "../onboarding-flow";

type PhoneVerificationFormData = {
  phoneNumber: string;
  verificationCode: string;
};

type PhoneVerificationStepProps = {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
};

const phoneValidationSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .matches(/^\+?[1-9]\d{7,14}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  verificationCode: yup.string().defined(),
});

const codeValidationSchema = yup.object().shape({
  phoneNumber: yup.string().required(),
  verificationCode: yup
    .string()
    .matches(/^\d{6}$/, "Verification code must be 6 digits")
    .required("Verification code is required"),
});

export default function PhoneVerificationStep({
  data,
  onNext,
  onBack,
}: PhoneVerificationStepProps) {
  const fetchPhoneInitiate = useAuthPhoneInitiateService();
  const fetchPhoneVerify = useAuthPhoneVerifyService();
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";
  const router = useRouter();

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const methods = useForm<PhoneVerificationFormData>({
    resolver: yupResolver(
      isCodeSent ? codeValidationSchema : phoneValidationSchema
    ),
    defaultValues: {
      phoneNumber: data.phoneNumber || "",
      verificationCode: "",
    },
  });

  const { handleSubmit } = methods;

  const onSendCode = handleSubmit(async (formData) => {
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data: responseData, status } = await fetchPhoneInitiate({
        phoneNumber: formData.phoneNumber,
      });

      if (status === HTTP_CODES_ENUM.OK || status === HTTP_CODES_ENUM.CREATED) {
        setIsCodeSent(true);
        setSuccessMessage(
          `Verification code sent to ${responseData.phoneNumber}. It will expire at ${new Date(
            responseData.expiresAt
          ).toLocaleTimeString()}`
        );
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } catch (error) {
      // Only redirect if the error specifically indicates already fully verified
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { errors?: { verification?: string } };
        };
      };
      if (
        axiosError?.response?.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY
      ) {
        const errorMessage = axiosError?.response?.data?.errors?.verification;
        if (errorMessage === "alreadyFullyVerified") {
          setSuccessMessage("Your phone is already verified! Redirecting...");
          setTimeout(() => {
            router.push("/signup-complete");
          }, 1500);
        } else {
          // Other validation errors
          setError("Failed to send verification code. Please try again.");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const onVerifyCode = handleSubmit(async (formData) => {
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const { status } = await fetchPhoneVerify({
        phoneNumber: formData.phoneNumber,
        code: formData.verificationCode,
      });

      if (
        status === HTTP_CODES_ENUM.OK ||
        status === HTTP_CODES_ENUM.NO_CONTENT
      ) {
        setSuccessMessage("Phone number verified successfully!");

        // Store data and complete onboarding
        onNext({
          phoneNumber: formData.phoneNumber,
          verificationCode: formData.verificationCode,
        });

        // Redirect to signup complete page to force auth refresh
        setTimeout(() => {
          router.push("/signup-complete");
        }, 1500);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleResendCode = async () => {
    setIsCodeSent(false);
    setSuccessMessage("");
    methods.setValue("verificationCode", "");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={isCodeSent ? onVerifyCode : onSendCode}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" textAlign="center" gutterBottom>
              Phone Verification
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3 }}
            >
              {isCodeSent
                ? "Enter the 6-digit code sent to your phone"
                : "Verify your phone number to complete registration"}
            </Typography>
          </Grid>

          {/* Phone Number Input */}
          <Grid size={{ xs: 12 }}>
            <FormTextInput<PhoneVerificationFormData>
              name="phoneNumber"
              label="Phone Number (+1234567890)"
              disabled={isCodeSent}
              testId="phone-number"
              autoFocus={!isCodeSent}
            />
          </Grid>

          {/* Verification Code Input */}
          {isCodeSent && (
            <Grid size={{ xs: 12 }}>
              <FormTextInput<PhoneVerificationFormData>
                name="verificationCode"
                label="Verification Code (6 digits)"
                testId="verification-code"
                autoFocus
              />
            </Grid>
          )}

          {/* Success Message */}
          {successMessage && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                {successMessage}
              </Alert>
            </Grid>
          )}

          {/* Error Message */}
          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                fullWidth
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                  color: isLightMode ? "black" : "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  borderRadius: "12px",
                  padding: (theme) => theme.spacing(1.5, 3),
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(99, 102, 241, 0.6)",
                  },
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "inherit" }}
                    />
                    {isCodeSent ? "Verifying..." : "Sending Code..."}
                  </>
                ) : isCodeSent ? (
                  "Verify Code"
                ) : (
                  "Send Verification Code"
                )}
              </Button>

              {isCodeSent && (
                <Button
                  variant="text"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Didn&apos;t receive code? Resend
                </Button>
              )}

              {onBack && (
                <Button
                  variant="outlined"
                  onClick={onBack}
                  disabled={isSubmitting}
                  fullWidth
                >
                  Back
                </Button>
              )}
            </Box>
          </Grid>

          {/* Security Notice */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: "rgba(0,0,0,0.05)",
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                display="block"
              >
                We use SMS verification to ensure account security. Standard
                messaging rates may apply.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
}
