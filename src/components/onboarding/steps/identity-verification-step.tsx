"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { useForm, FormProvider, useWatch, Control } from "react-hook-form";
import { useAuthIdentityVerifyService } from "@/services/api/services/auth";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useColorScheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FileEntity } from "@/services/api/types/file-entity";
import { OnboardingData } from "../onboarding-flow";
import FormImagePicker from "@/components/form/image-picker/image-picker";

type IdentityVerificationFormData = {
  idDocument: FileEntity | null;
  selfie: FileEntity | null;
};

type IdentityVerificationStepProps = {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
};

const useValidationSchema = () => {
  return yup.object().shape({
    idDocument: yup
      .mixed<FileEntity>()
      .required("ID document is required")
      .nullable(),
    selfie: yup.mixed<FileEntity>().required("Selfie is required").nullable(),
  });
};

// Separate component to handle form watching to avoid re-renders
function SubmitButton({
  control,
  isVerifying,
  isLightMode,
  onBack,
}: {
  control: Control<IdentityVerificationFormData>;
  isVerifying: boolean;
  isLightMode: boolean;
  onBack?: () => void;
}) {
  const idDocument = useWatch({ control, name: "idDocument" });
  const selfie = useWatch({ control, name: "selfie" });
  const hasImages = idDocument && selfie;

  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        gap: 2,
        justifyContent: "center",
      }}
    >
      {onBack && (
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isVerifying}
          sx={{ minWidth: 120 }}
        >
          Back
        </Button>
      )}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={!hasImages || isVerifying}
        sx={{
          minWidth: 200,
          background: hasImages
            ? "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)"
            : undefined,
          color: isLightMode ? "black" : "white",
          fontSize: "16px",
          fontWeight: 600,
          borderRadius: "12px",
          padding: (theme) => theme.spacing(1.5, 3),
          "&:hover": {
            transform: hasImages ? "translateY(-2px)" : "none",
            boxShadow: hasImages
              ? "0 8px 25px rgba(99, 102, 241, 0.6)"
              : "none",
          },
        }}
      >
        {isVerifying ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
            Verifying Identity...
          </>
        ) : (
          "Verify Identity"
        )}
      </Button>
    </Box>
  );
}

export default function IdentityVerificationStep({
  data,
  onNext,
  onBack,
}: IdentityVerificationStepProps) {
  const fetchAuthIdentityVerify = useAuthIdentityVerifyService();
  const validationSchema = useValidationSchema();
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    similarity?: number;
    extractedFirstName?: string;
    extractedLastName?: string;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const methods = useForm<IdentityVerificationFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      idDocument: data.idDocument || null,
      selfie: data.selfie || null,
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    if (!formData.idDocument || !formData.selfie) {
      setError("Please upload both ID document and selfie");
      return;
    }

    setIsVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      const { data: responseData, status } = await fetchAuthIdentityVerify({
        idDocumentId: formData.idDocument.id,
        selfieId: formData.selfie.id,
      });

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        setError("Verification failed. Please try again with clearer images.");
        return;
      }

      if (status === HTTP_CODES_ENUM.OK) {
        setVerificationResult(responseData);

        if (responseData.success) {
          // Wait a moment to show success message, then move to next step
          setTimeout(() => {
            onNext({
              idDocument: formData.idDocument,
              selfie: formData.selfie,
            });
          }, 2000);
        }
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" textAlign="center" gutterBottom>
              Identity Verification
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3 }}
            >
              We need to verify your identity by comparing your ID document with
              a selfie
            </Typography>
          </Grid>

          {/* ID Document Upload */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>
              1. Upload ID Document
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload a clear photo of your government-issued ID (passport,
              driver&apos;s license, or national ID)
            </Typography>
            <FormImagePicker
              name="idDocument"
              testId="id-document-upload"
              label="ID Document"
            />
          </Grid>

          {/* Selfie Upload */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>
              2. Take a Selfie
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Take a clear selfie that matches the photo on your ID document
            </Typography>
            <FormImagePicker
              name="selfie"
              testId="selfie-upload"
              label="Selfie"
            />
          </Grid>

          {/* Error Alert */}
          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <Grid size={{ xs: 12 }}>
              <Alert
                severity={verificationResult.success ? "success" : "error"}
                sx={{ mt: 2 }}
                icon={
                  verificationResult.success ? <CheckCircleIcon /> : undefined
                }
              >
                <Typography variant="body1">
                  {verificationResult.message}
                </Typography>
                {verificationResult.success &&
                  verificationResult.similarity && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Face match confidence:{" "}
                      {verificationResult.similarity.toFixed(1)}%
                    </Typography>
                  )}
                {verificationResult.success &&
                  verificationResult.extractedFirstName && (
                    <Typography variant="body2">
                      Extracted name: {verificationResult.extractedFirstName}{" "}
                      {verificationResult.extractedLastName}
                    </Typography>
                  )}
                {verificationResult.success && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, fontWeight: "bold" }}
                  >
                    Moving to phone verification...
                  </Typography>
                )}
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <SubmitButton
              control={control}
              isVerifying={isVerifying}
              isLightMode={isLightMode}
              onBack={onBack}
            />
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
                Your documents are securely processed and encrypted. We use AWS
                Rekognition for face verification (95%+ accuracy required) and
                AWS Textract for document verification.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
}
