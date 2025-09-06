"use client";
import Button from "@mui/material/Button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import {
  useAuthLoginService,
  useAuthSignUpService,
} from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import Container from "@mui/material/Container";
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
import AuthPageWrapper from "@/components/auth/auth-page-wrapper";
import GlassmorphismCard from "@/components/auth/glassmorphism-card";
import { useTranslation } from "@/services/i18n/client";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import SocialAuth from "@/services/social-auth/social-auth";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  policy: TPolicy[];
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("sign-up:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("sign-up:inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("sign-up:inputs.email.validation.invalid"))
      .required(t("sign-up:inputs.email.validation.required")),
    phoneNumber: yup
      .string()
      .matches(
        /^\+1[0-9]{10}$/,
        t("sign-up:inputs.phoneNumber.validation.invalid")
      )
      .required(t("sign-up:inputs.phoneNumber.validation.required")),
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
        color: "white",
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
      {t("sign-up:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const fetchAuthSignUp = useAuthSignUpService();
  const { t } = useTranslation("sign-up");
  const validationSchema = useValidationSchema();
  const policyOptions = [
    { id: "policy", name: t("sign-up:inputs.policy.agreement") },
  ];

  const methods = useForm<SignUpFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      policy: [],
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data: dataSignUp, status: statusSignUp } =
      await fetchAuthSignUp(formData);

    if (statusSignUp === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(dataSignUp.errors) as Array<keyof SignUpFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-up:inputs.${key}.validation.server.${dataSignUp.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    const { data: dataSignIn, status: statusSignIn } = await fetchAuthLogin({
      email: formData.email,
      password: formData.password,
    });

    if (statusSignIn === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: dataSignIn.token,
        refreshToken: dataSignIn.refreshToken,
        tokenExpires: dataSignIn.tokenExpires,
      });
      setUser(dataSignIn.user);
    }
  });

  return (
    <AuthPageWrapper>
      <FormProvider {...methods}>
        <Container maxWidth="xs">
          <GlassmorphismCard
            sx={{
              padding: { xs: 2, sm: 3 },
              margin: { xs: 1, sm: 2 },
              mt: { xs: 2, sm: 4 },
            }}
          >
            <form onSubmit={onSubmit}>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12 }} mt={3}>
                  <Typography variant="h6">{t("sign-up:title")}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormTextInput<SignUpFormData>
                    name="firstName"
                    label={t("sign-up:inputs.firstName.label")}
                    type="text"
                    autoFocus
                    testId="first-name"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormTextInput<SignUpFormData>
                    name="lastName"
                    label={t("sign-up:inputs.lastName.label")}
                    type="text"
                    testId="last-name"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormTextInput<SignUpFormData>
                    name="email"
                    label={t("sign-up:inputs.email.label")}
                    type="email"
                    testId="email"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormTextInput<SignUpFormData>
                    name="phoneNumber"
                    label={t("sign-up:inputs.phoneNumber.label")}
                    type="tel"
                    testId="phone-number"
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
                        color: "white",
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
          </GlassmorphismCard>
        </Container>
      </FormProvider>
    </AuthPageWrapper>
  );
}

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);
