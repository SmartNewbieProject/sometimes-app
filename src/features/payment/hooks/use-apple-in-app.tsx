import { queryClient } from "@/src/shared/config/query";
import { useMutation, useQuery } from "@tanstack/react-query";
import paymentApis from "../api";
import { devLogWithTag } from "@/src/shared/utils";

export const useAppleInApp = () => {
  return useMutation({
    mutationFn: (transactionReceipt: string) => {
      // 클라이언트 측에서 추가 유효성 검증
      if (!transactionReceipt || transactionReceipt.trim() === "") {
        throw new Error("TransactionReceipt is empty or invalid");
      }

      devLogWithTag('Apple IAP', 'Verifying receipt:', {
        length: transactionReceipt.length,
      });

      return paymentApis.postAppleVerifyPurchase(transactionReceipt);
    },
    onSuccess: async () => {
      devLogWithTag('Apple IAP', 'Verification successful');
      await queryClient.invalidateQueries({
        queryKey: ["gem", "current"],
      });
      await queryClient.refetchQueries({
        queryKey: ["gem", "current"],
      });
    },
    onError: (error) => {
      console.error("❌ Apple receipt verification failed:", error);
    },
  });
};
