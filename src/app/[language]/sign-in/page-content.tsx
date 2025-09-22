"use client";
import Button from "@mui/material/Button";
import LinkItem from "@mui/material/Link";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import {
  useAuthInitiateLoginService,
  useAuthVerifyLoginService,
} from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "@/components/link";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import AuthPageWrapper from "@/components/auth/auth-page-wrapper";
import GlassmorphismCard from "@/components/auth/glassmorphism-card";
import { useTranslation } from "@/services/i18n/client";
import SocialAuth from "@/services/social-auth/social-auth";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import OtpInputComponent from "@/components/form/otp-input/otp-input";
import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useColorScheme } from "@mui/material/styles";

type SignInFormData = {
  email: string;
  password: string;
};

type LoginStep = "credentials" | "otp";

const useValidationSchema = () => {
  const { t } = useTranslation("sign-in");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-in:inputs.email.validation.invalid"))
      .required(t("sign-in:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-in:inputs.password.validation.min"))
      .required(t("sign-in:inputs.password.validation.required")),
  });
};

function CredentialsFormActions() {
  const { t } = useTranslation("sign-in");
  const { isSubmitting } = useFormState();
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-in-submit"
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
      {t("sign-in:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthInitiateLogin = useAuthInitiateLoginService();
  const fetchAuthVerifyLogin = useAuthVerifyLoginService();
  const { t } = useTranslation("sign-in");
  const validationSchema = useValidationSchema();
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";

  const [currentStep, setCurrentStep] = useState<LoginStep>("credentials");
  const [userEmail, setUserEmail] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const methods = useForm<SignInFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onCredentialsSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthInitiateLogin(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      // Check if the error is about unverified account
      const errorMessages = Object.values(data.errors || {}).join(" ");
      if (
        errorMessages.includes("not verified") ||
        errorMessages.includes("verification")
      ) {
        // User exists but not fully verified - redirect to onboarding
        setError("email", {
          type: "manual",
          message:
            "Your account needs to complete verification. Redirecting to complete signup...",
        });

        // Delay to show message, then redirect
        setTimeout(() => {
          window.location.href = "/sign-up";
        }, 2000);
        return;
      }

      // Normal validation errors
      (Object.keys(data.errors) as Array<keyof SignInFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-in:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );
      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      // Log response for debugging
      console.log("Login initiate response:", data);

      // Check if we should skip OTP (for partially verified users)
      if (data.skipOtp === true && data.loginData) {
        // User is not fully verified - log them in and redirect to complete signup
        setTokensInfo({
          token: data.loginData.token,
          refreshToken: data.loginData.refreshToken,
          tokenExpires: data.loginData.tokenExpires,
        });
        setUser(data.loginData.user);

        // Redirect to sign-up to complete verification
        setTimeout(() => {
          window.location.href = "/sign-up";
        }, 100);
        return;
      } else if (data.temporaryToken) {
        // Normal OTP flow for fully verified users
        setUserEmail(formData.email);
        setCurrentStep("otp");
      }
    }
  });

  const handleOtpComplete = async (otpCode: string) => {
    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const { data, status } = await fetchAuthVerifyLogin({
        email: userEmail,
        otpCode,
      });

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        setOtpError(t("sign-in:otp.validation.invalid"));
        return;
      }

      if (status === HTTP_CODES_ENUM.OK) {
        setTokensInfo({
          token: data.token,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires,
        });
        setUser(data.user);
      }
    } catch (error) {
      setOtpError(t("sign-in:otp.validation.invalid"));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleBackToCredentials = () => {
    setCurrentStep("credentials");
    setOtpError("");
  };

  if (currentStep === "otp") {
    return (
      <AuthPageWrapper>
        <Container maxWidth="sm">
          <GlassmorphismCard
            sx={{
              padding: { xs: 2, sm: 3, md: 4 },
              margin: { xs: 1, sm: 2 },
              maxWidth: { xs: "100%", sm: "400px", md: "500px" },
              mx: "auto",
            }}
          >
            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" textAlign="center">
                  {t("sign-in:otp.title")}
                </Typography>
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                  mt={1}
                >
                  {t("sign-in:otp.description")}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }} mt={2}>
                <Box display="flex" justifyContent="center">
                  <OtpInputComponent
                    length={6}
                    onComplete={handleOtpComplete}
                    disabled={isVerifyingOtp}
                    error={!!otpError}
                    autoFocus
                  />
                </Box>
              </Grid>

              {otpError && (
                <Grid size={{ xs: 12 }}>
                  <Typography color="error" variant="body2" textAlign="center">
                    {otpError}
                  </Typography>
                </Grid>
              )}

              {isVerifyingOtp && (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="center">
                    <CircularProgress size={24} />
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }} mt={2}>
                <Box display="flex" justifyContent="center">
                  <Button
                    variant="text"
                    onClick={handleBackToCredentials}
                    disabled={isVerifyingOtp}
                  >
                    {t("sign-in:otp.actions.back")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </GlassmorphismCard>
        </Container>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      <FormProvider {...methods}>
        <Container maxWidth="xs">
          <GlassmorphismCard
            sx={{
              padding: { xs: 2, sm: 3 },
              margin: { xs: 1, sm: 2 },
            }}
          >
            <form onSubmit={onCredentialsSubmit}>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6">{t("sign-in:title")}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormTextInput<SignInFormData>
                    name="email"
                    label={t("sign-in:inputs.email.label")}
                    type="email"
                    testId="email"
                    autoFocus
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormTextInput<SignInFormData>
                    name="password"
                    label={t("sign-in:inputs.password.label")}
                    type="password"
                    testId="password"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <LinkItem
                    component={Link}
                    href="/forgot-password"
                    data-testid="forgot-password"
                  >
                    {t("sign-in:actions.forgotPassword")}
                  </LinkItem>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    gap={1}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <CredentialsFormActions />

                    {IS_SIGN_UP_ENABLED && (
                      <Button
                        variant="contained"
                        color="inherit"
                        LinkComponent={Link}
                        href="/sign-up"
                        data-testid="create-account"
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
                        {t("sign-in:actions.createAccount")}
                      </Button>
                    )}
                  </Box>
                </Grid>

                {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ mb: 2 }}>
                      <Chip label={t("sign-in:or")} />
                    </Divider>

                    <SocialAuth />
                  </Grid>
                )}
              </Grid>
            </form>
          </GlassmorphismCard>
        </Container>
      </FormProvider>
    </AuthPageWrapper>
  );
}

function SignIn() {
  return <Form />;
}

export default withPageRequiredGuest(SignIn);
