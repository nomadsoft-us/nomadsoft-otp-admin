import { createQueryKeys } from "@/services/react-query/query-key-factory";

export const verificationStatusQueryKeys = createQueryKeys(
  ["verification-status"],
  {
    status: () => ({
      key: [],
    }),
  }
);

export default verificationStatusQueryKeys;
