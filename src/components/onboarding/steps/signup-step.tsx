"use client";
import Button from "@mui/material/Button";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthSignupStep1Service } from "@/services/api/services/auth";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormCheckboxInput from "@/components/form/checkbox/form-checkbox";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "@/components/link";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import SocialAuth from "@/services/social-auth/social-auth";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { useColorScheme } from "@mui/material/styles";
import { OnboardingData } from "../onboarding-flow";
import React, { useState, useEffect } from "react";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import CircularProgress from "@mui/material/CircularProgress";

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  email: string;
  password: string;
  policy: TPolicy[];
};

type SignUpStepProps = {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-up:inputs.email.validation.invalid"))
      .required(t("sign-up:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-up:inputs.password.validation.min"))
      .required(t("sign-up:inputs.password.validation.required")),
    policy: yup
      .array()
      .min(1, t("sign-up:inputs.policy.validation.required"))
      .required(),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-up");
  const { isSubmitting } = useFormState();
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-up-submit"
      fullWidth
      sx={{
        background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
        border: "none",
        borderRadius: "12px",
        padding: (theme) => theme.spacing(2, 3),
        color: isLightMode ? "black" : "white",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
          transition: "left 0.5s ease",
        },
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(99, 102, 241, 0.6)",
          "&::before": {
            left: "100%",
          },
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }}
    >
      {isSubmitting ? "Creating Account..." : t("sign-up:actions.submit")}
    </Button>
  );
}

export default function SignUpStep({ data, onNext }: SignUpStepProps) {
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthSignupStep1 = useAuthSignupStep1Service();
  const { t } = useTranslation("sign-up");
  const validationSchema = useValidationSchema();
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";
  const policyOptions = [
    { id: "policy", name: t("sign-up:inputs.policy.agreement") },
  ];

  // Check if user already has a token (resuming onboarding)
  const [hasExistingToken] = useState(() => {
    const tokens = getTokensInfo();
    return !!tokens?.token;
  });

  const methods = useForm<SignUpFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: data.email || "",
      password: data.password || "",
      policy: [],
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data: responseData, status } = await fetchAuthSignupStep1({
      email: formData.email,
      password: formData.password,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(responseData.errors) as Array<keyof SignUpFormData>).forEach(
        (key) => {
          if (key !== "policy") {
            setError(key, {
              type: "manual",
              message: t(
                `sign-up:inputs.${key}.validation.server.${responseData.errors[key]}`
              ),
            });
          }
        }
      );
      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      // Store tokens but don't log in yet
      setTokensInfo({
        token: responseData.token,
        refreshToken: responseData.refreshToken,
        tokenExpires: responseData.tokenExpires,
      });

      // Move to next step with data
      onNext({
        email: formData.email,
        password: formData.password,
        token: responseData.token,
        refreshToken: responseData.refreshToken,
        tokenExpires: responseData.tokenExpires,
      });
    }
  });

  // Auto-proceed if user already has a token
  useEffect(() => {
    if (hasExistingToken) {
      // Auto-proceed to next step after a brief moment
      const timer = setTimeout(() => {
        onNext({});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasExistingToken, onNext]);

  // If user already has a token, they're resuming - show a message
  if (hasExistingToken) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome back!
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Resuming your onboarding process...
        </Typography>
        <Box sx={{ mt: 3 }}>
          <CircularProgress size={30} />
        </Box>
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">{t("sign-up:title")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your account to get started
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormTextInput<SignUpFormData>
              name="email"
              label={t("sign-up:inputs.email.label")}
              type="email"
              autoFocus
              testId="email"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormTextInput<SignUpFormData>
              name="password"
              label={t("sign-up:inputs.password.label")}
              type="password"
              testId="password"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormCheckboxInput
              name="policy"
              label=""
              testId="privacy"
              options={policyOptions}
              keyValue="id"
              keyExtractor={(option) => option.id.toString()}
              renderOption={(option) => (
                <span>
                  {option.name}
                  <MuiLink href="/privacy-policy" target="_blank">
                    {t("sign-up:inputs.policy.label")}
                  </MuiLink>
                </span>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              display="flex"
              gap={1}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <FormActions />
              <Button
                variant="contained"
                color="inherit"
                LinkComponent={Link}
                data-testid="login"
                href="/sign-in"
                fullWidth
                sx={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  padding: (theme) => theme.spacing(2, 3),
                  color: isLightMode ? "black" : "white",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.15)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                {t("sign-up:actions.accountAlreadyExists")}
              </Button>
            </Box>
          </Grid>

          {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ mb: 2 }}>
                <Chip label={t("sign-up:or")} />
              </Divider>

              <SocialAuth />
            </Grid>
          )}
        </Grid>
      </form>
    </FormProvider>
  );
}
