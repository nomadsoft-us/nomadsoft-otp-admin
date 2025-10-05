"use client";
import { useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "../i18n/use-language";
import { RoleEnum } from "../api/types/role";
import { getTokensInfo } from "./auth-tokens-info";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type PropsType = {
  params?: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

type OptionsType = {
  roles?: RoleEnum[];
  requireVerification?: boolean;
  skipVerificationForAdmin?: boolean;
};

const defaultRoles = Object.values(RoleEnum).filter(
  (value) => !Number.isNaN(Number(value))
) as RoleEnum[];

// ALL verification routes go to sign-up - the onboarding flow handles the correct step
const VERIFICATION_ROUTE_MAP = {
  email_verified: "/sign-up",
  identity_verified: "/sign-up",
  fully_verified: null, // No redirect needed
};

function withPageRequiredVerifiedAuth(
  Component: FunctionComponent<PropsType>,
  options?: OptionsType
) {
  const optionRoles = options?.roles || defaultRoles;
  const requireVerification = options?.requireVerification ?? true;
  const skipVerificationForAdmin = options?.skipVerificationForAdmin ?? true;

  return function WithPageRequiredVerifiedAuth(props: PropsType) {
    const { user, isLoaded, verificationStatus, isVerificationLoaded } =
      useAuth();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        // Wait for both auth and verification to load
        if (!isLoaded || !isVerificationLoaded) return;

        const tokensInfo = getTokensInfo();
        const hasToken = !!tokensInfo?.token;

        // STEP 1: Check for token
        if (!hasToken) {
          const currentLocation = window.location.toString();
          const returnToPath =
            currentLocation.replace(new URL(currentLocation).origin, "") ||
            `/${language}`;
          const params = new URLSearchParams({
            returnTo: returnToPath,
          });

          const redirectTo = `/${language}/sign-in?${params.toString()}`;
          router.replace(redirectTo);
          return;
        }

        // STEP 2: Check role if user exists
        if (user) {
          const userRoleId = Number(user?.role?.id);
          const isAdmin = userRoleId === RoleEnum.ADMIN;

          // Check if user has required role
          if (!optionRoles.includes(userRoleId)) {
            router.replace(`/${language}`);
            return;
          }

          // STEP 3: Check verification status (unless admin and skip is enabled)
          if (requireVerification && !(isAdmin && skipVerificationForAdmin)) {
            // Check if user is fully verified from user object first
            const isFullyVerified =
              user.verificationStep === "fully_verified" ||
              verificationStatus?.isFullyVerified;

            if (!isFullyVerified) {
              // Determine where to redirect based on verification step
              const currentStep =
                user.verificationStep ||
                verificationStatus?.currentStep ||
                "email_verified";

              const redirectRoute = VERIFICATION_ROUTE_MAP[currentStep];
              if (redirectRoute) {
                router.replace(`/${language}${redirectRoute}`);
                return;
              }
              // If we can't determine the route, go to onboarding start
              router.replace(`/${language}/sign-up`);
              return;
            }
          }
        } else if (hasToken) {
          // We have a token but no user - likely in onboarding
          // Redirect to sign-up/onboarding flow
          router.replace(`/${language}/sign-up`);
          return;
        }
      };

      check();
    }, [
      user,
      isLoaded,
      verificationStatus,
      isVerificationLoaded,
      router,
      language,
    ]);

    // Show loading while auth is loading
    if (!isLoaded || !isVerificationLoaded) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      );
    }

    const tokensInfo = getTokensInfo();
    const hasToken = !!tokensInfo?.token;

    // Show nothing if conditions aren't met
    if (!hasToken) return null;

    if (user) {
      const userRoleId = Number(user?.role?.id);
      const isAdmin = userRoleId === RoleEnum.ADMIN;

      // Check role
      if (!optionRoles.includes(userRoleId)) {
        return null;
      }

      // Check verification (unless admin and skip is enabled)
      if (requireVerification && !(isAdmin && skipVerificationForAdmin)) {
        if (!verificationStatus?.isFullyVerified) {
          return null;
        }
      }
    } else {
      // Has token but no user - still in onboarding
      return null;
    }

    return <Component {...props} />;
  };
}

export default withPageRequiredVerifiedAuth;
