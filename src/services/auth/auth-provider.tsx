"use client";

import { User } from "@/services/api/types/user";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
  TokensInfo,
  VerificationStatus,
} from "./auth-context";
import useFetch from "@/services/api/use-fetch";
import { API_URL, AUTH_LOGOUT_URL, AUTH_ME_URL } from "@/services/api/config";
import HTTP_CODES_ENUM from "../api/types/http-codes";
import {
  getTokensInfo,
  setTokensInfo as setTokensInfoToStorage,
} from "./auth-tokens-info";

function AuthProvider(props: PropsWithChildren<{}>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [isVerificationLoaded, setIsVerificationLoaded] = useState(false);
  const fetchBase = useFetch();

  const setTokensInfo = useCallback((tokensInfo: TokensInfo) => {
    setTokensInfoToStorage(tokensInfo);

    if (!tokensInfo) {
      setUser(null);
    }
  }, []);

  const logOut = useCallback(async () => {
    const tokens = getTokensInfo();

    if (tokens?.token) {
      await fetchBase(AUTH_LOGOUT_URL, {
        method: "POST",
      });
    }
    setTokensInfo(null);
    // Always redirect to login page after logout
    window.location.href = "/sign-in";
  }, [setTokensInfo, fetchBase]);

  const fetchVerificationStatus = useCallback(async () => {
    const tokens = getTokensInfo();

    if (!tokens?.token) {
      setVerificationStatus(null);
      setIsVerificationLoaded(true);
      return;
    }

    try {
      const response = await fetchBase(
        `${API_URL}/v1/auth/verification/status`,
        {
          method: "GET",
        }
      );

      if (response.status === HTTP_CODES_ENUM.OK) {
        const data = await response.json();
        const status: VerificationStatus = {
          currentStep: data.currentStep,
          nextRoute: data.nextRoute,
          isFullyVerified:
            data.isFullyVerified || data.currentStep === "fully_verified",
          isEmailVerified: [
            "email_verified",
            "identity_verified",
            "fully_verified",
          ].includes(data.currentStep),
          isIdentityVerified: ["identity_verified", "fully_verified"].includes(
            data.currentStep
          ),
          message: data.message || "",
        };
        setVerificationStatus(status);
      } else {
        // If verification status fails, assume unverified
        setVerificationStatus({
          currentStep: "email_verified",
          nextRoute: "/verify-identity",
          isFullyVerified: false,
          isEmailVerified: true,
          isIdentityVerified: false,
          message: "Unable to fetch verification status",
        });
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      setVerificationStatus(null);
    } finally {
      setIsVerificationLoaded(true);
    }
  }, [fetchBase]);

  const refreshVerificationStatus = useCallback(async () => {
    setIsVerificationLoaded(false);
    await fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const loadData = useCallback(async () => {
    const tokens = getTokensInfo();

    try {
      if (tokens?.token) {
        const response = await fetchBase(AUTH_ME_URL, {
          method: "GET",
        });

        if (response.status === HTTP_CODES_ENUM.UNAUTHORIZED) {
          logOut();
          return;
        }

        const data = await response.json();
        setUser(data);

        // Also fetch verification status when we have a token
        await fetchVerificationStatus();
      } else {
        setVerificationStatus(null);
        setIsVerificationLoaded(true);
      }
    } finally {
      setIsLoaded(true);
    }
  }, [fetchBase, logOut, fetchVerificationStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const contextValue = useMemo(
    () => ({
      isLoaded,
      user,
      verificationStatus,
      isVerificationLoaded,
    }),
    [isLoaded, user, verificationStatus, isVerificationLoaded]
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser,
      logOut,
      refreshVerificationStatus,
    }),
    [logOut, refreshVerificationStatus]
  );

  const contextTokensValue = useMemo(
    () => ({
      setTokensInfo,
    }),
    [setTokensInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {props.children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
