import { queryClient } from "@/src/shared/config/query";
import { useMutation, useQuery } from "@tanstack/react-query";
import paymentApis from "../api";

export const useAppleInApp = () => {
  return useMutation({
    mutationFn: (transactionReceipt: string) =>
      paymentApis.postAppleVerifyPurchase(transactionReceipt),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["gem", "current"],
      });
      await queryClient.refetchQueries({
        queryKey: ["gem", "current"],
      });
    },
  });
};
