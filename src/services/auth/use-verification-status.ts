import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  useAuthVerificationStatusService,
  VerificationStatusResponse,
} from "@/services/api/services/auth";
import { RequestConfigType } from "@/services/api/services/types/request-config";
import verificationStatusQueryKeys from "@/hooks/queries/use-verification-status-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export function useVerificationStatus(
  requestConfig?: RequestConfigType
): UseQueryResult<VerificationStatusResponse, Error> & {
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  isFullyVerified: boolean;
  nextRoute: string | null;
  shouldRedirect: boolean;
} {
  const fetchVerificationStatus = useAuthVerificationStatusService();

  const queryResult = useQuery({
    queryKey: verificationStatusQueryKeys.status().key,
    queryFn: async () => {
      const result = await fetchVerificationStatus(requestConfig);
      if (
        result.status === HTTP_CODES_ENUM.OK ||
        result.status === HTTP_CODES_ENUM.CREATED
      ) {
        return result.data;
      }
      throw new Error("Failed to fetch verification status");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const data = queryResult.data;
  const isEmailVerified =
    data?.currentStep === "email_verified" ||
    data?.currentStep === "identity_verified" ||
    data?.currentStep === "fully_verified";
  const isIdentityVerified =
    data?.currentStep === "identity_verified" ||
    data?.currentStep === "fully_verified";
  const isFullyVerified = data?.currentStep === "fully_verified";
  const nextRoute = data?.nextRoute || null;
  const shouldRedirect = !isFullyVerified && !!nextRoute;

  return {
    ...queryResult,
    isEmailVerified,
    isIdentityVerified,
    isFullyVerified,
    nextRoute,
    shouldRedirect,
  };
}

export default useVerificationStatus;
