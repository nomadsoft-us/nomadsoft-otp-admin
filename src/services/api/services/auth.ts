import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import { User } from "../types/user";
import { Tokens } from "../types/tokens";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = Tokens & {
  user: User;
};

export type AuthInitiateLoginRequest = {
  email: string;
  password: string;
};

export type AuthInitiateLoginResponse = {
  success: boolean;
  message: string;
  temporaryToken?: string;
  expiresAt?: string;
  skipOtp?: boolean;
  loginData?: AuthLoginResponse;
};

export type AuthVerifyLoginRequest = {
  email: string;
  otpCode: string;
};

export type AuthVerifyLoginResponse = Tokens & {
  user: User;
};

export function useAuthLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthLoginRequest) => {
      return fetchBase(`${API_URL}/v1/auth/email/login`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthLoginResponse>);
    },
    [fetchBase]
  );
}

export function useAuthInitiateLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthInitiateLoginRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/login/initiate`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthInitiateLoginResponse>);
    },
    [fetchBase]
  );
}

export function useAuthVerifyLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthVerifyLoginRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/login/verify`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthVerifyLoginResponse>);
    },
    [fetchBase]
  );
}

export type AuthGoogleLoginRequest = {
  idToken: string;
};

export type AuthGoogleLoginResponse = Tokens & {
  user: User;
};

export function useAuthGoogleLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthGoogleLoginRequest) => {
      return fetchBase(`${API_URL}/v1/auth/google/login`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthGoogleLoginResponse>);
    },
    [fetchBase]
  );
}

export type AuthFacebookLoginRequest = {
  accessToken: string;
};

export type AuthFacebookLoginResponse = Tokens & {
  user: User;
};

export function useAuthFacebookLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthFacebookLoginRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/facebook/login`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthFacebookLoginResponse>);
    },
    [fetchBase]
  );
}

export type AuthSignUpRequest = {
  email: string;
  password: string;
};

export type AuthSignUpResponse = void;

export function useAuthSignUpService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthSignUpRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/register`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthSignUpResponse>);
    },
    [fetchBase]
  );
}

export type AuthSignupInitiateRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type AuthSignupInitiateResponse = {
  success: boolean;
  message: string;
  expiresAt: string;
  phoneNumber: string;
};

export function useAuthSignupInitiateService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthSignupInitiateRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/signup/initiate`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthSignupInitiateResponse>);
    },
    [fetchBase]
  );
}

export type AuthSignupVerifyRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  code: string;
};

export type AuthSignupVerifyResponse = void;

export function useAuthSignupVerifyService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthSignupVerifyRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/signup/verify`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthSignupVerifyResponse>);
    },
    [fetchBase]
  );
}

export type AuthConfirmEmailRequest = {
  hash: string;
};

export type AuthConfirmEmailResponse = void;

export function useAuthConfirmEmailService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthConfirmEmailRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/confirm`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthConfirmEmailResponse>);
    },
    [fetchBase]
  );
}

export type AuthConfirmNewEmailRequest = {
  hash: string;
};

export type AuthConfirmNewEmailResponse = void;

export function useAuthConfirmNewEmailService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthConfirmNewEmailRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/email/confirm/new`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthConfirmNewEmailResponse>);
    },
    [fetchBase]
  );
}

export type AuthForgotPasswordRequest = {
  email: string;
};

export type AuthForgotPasswordResponse = void;

export function useAuthForgotPasswordService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthForgotPasswordRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/forgot/password`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthForgotPasswordResponse>);
    },
    [fetchBase]
  );
}

export type AuthResetPasswordRequest = {
  password: string;
  hash: string;
};

export type AuthResetPasswordResponse = void;

export function useAuthResetPasswordService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthResetPasswordRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/reset/password`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthResetPasswordResponse>);
    },
    [fetchBase]
  );
}

export type AuthPatchMeRequest =
  | Partial<Pick<User, "firstName" | "lastName" | "email">>
  | { password: string; oldPassword: string };

export type AuthPatchMeResponse = User;

export function useAuthPatchMeService() {
  const fetch = useFetch();

  return useCallback(
    (data: AuthPatchMeRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/auth/me`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthPatchMeResponse>);
    },
    [fetch]
  );
}

export type AuthGetMeResponse = User;

export function useAuthGetMeService() {
  const fetch = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/auth/me`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthGetMeResponse>);
    },
    [fetch]
  );
}

// NEW STEP-BASED SIGNUP SERVICES

export type AuthSignupStep1Request = {
  email: string;
  password: string;
};

export type AuthSignupStep1Response = Tokens & {
  user: User;
};

export function useAuthSignupStep1Service() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthSignupStep1Request, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/signup/step1`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthSignupStep1Response>);
    },
    [fetchBase]
  );
}

export type VerificationStatusResponse = {
  currentStep: "email_verified" | "identity_verified" | "fully_verified";
  nextRoute: string;
  isFullyVerified: boolean;
  message: string;
};

export function useAuthVerificationStatusService() {
  const fetchBase = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/verification/status`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<VerificationStatusResponse>);
    },
    [fetchBase]
  );
}

export type AuthIdentityVerifyRequest = {
  idDocumentId: string;
  selfieId: string;
};

export type AuthIdentityVerifyResponse = {
  success: boolean;
  message: string;
  similarity?: number;
  extractedFirstName?: string;
  extractedLastName?: string;
  newVerificationStep?: string;
};

export function useAuthIdentityVerifyService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthIdentityVerifyRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/identity/verify`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthIdentityVerifyResponse>);
    },
    [fetchBase]
  );
}

export type AuthPhoneInitiateRequest = {
  phoneNumber: string;
};

export type AuthPhoneInitiateResponse = {
  success: boolean;
  message: string;
  expiresAt: string;
  phoneNumber: string;
};

export function useAuthPhoneInitiateService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthPhoneInitiateRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/phone/initiate`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthPhoneInitiateResponse>);
    },
    [fetchBase]
  );
}

export type AuthPhoneVerifyRequest = {
  phoneNumber: string;
  code: string;
};

export type AuthPhoneVerifyResponse = void;

export function useAuthPhoneVerifyService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthPhoneVerifyRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`${API_URL}/v1/auth/phone/verify`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthPhoneVerifyResponse>);
    },
    [fetchBase]
  );
}
