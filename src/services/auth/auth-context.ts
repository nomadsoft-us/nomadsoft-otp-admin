"use client";

import { Tokens } from "@/services/api/types/tokens";
import { User } from "@/services/api/types/user";
import { createContext } from "react";

export type TokensInfo = Tokens | null;

export type VerificationStatus = {
  currentStep: "email_verified" | "identity_verified" | "fully_verified";
  nextRoute: string;
  isFullyVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  message: string;
};

export const AuthContext = createContext<{
  user: User | null;
  isLoaded: boolean;
  verificationStatus: VerificationStatus | null;
  isVerificationLoaded: boolean;
}>({
  user: null,
  isLoaded: true,
  verificationStatus: null,
  isVerificationLoaded: false,
});

export const AuthActionsContext = createContext<{
  setUser: (user: User) => void;
  logOut: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
}>({
  setUser: () => {},
  logOut: async () => {},
  refreshVerificationStatus: async () => {},
});

export const AuthTokensContext = createContext<{
  setTokensInfo: (tokensInfo: TokensInfo) => void;
}>({
  setTokensInfo: () => {},
});
