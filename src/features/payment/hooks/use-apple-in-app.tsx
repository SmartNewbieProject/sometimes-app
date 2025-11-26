import { queryClient } from "@/src/shared/config/query";
import { useMutation, useQuery } from "@tanstack/react-query";
import paymentApis from "../api";

export const useAppleInApp = () => {
  return useMutation({
    mutationFn: (transactionReceipt: string) => {
      // 클라이언트 측에서 추가 유효성 검증
      if (!transactionReceipt || transactionReceipt.trim() === "") {
        throw new Error("TransactionReceipt is empty or invalid");
      }

      console.log("🔍 Verifying Apple receipt:", {
        length: transactionReceipt.length,
        prefix: transactionReceipt.substring(0, 20) + "..."
      });

      return paymentApis.postAppleVerifyPurchase(transactionReceipt);
    },
    onSuccess: async () => {
      console.log("✅ Apple receipt verification successful");
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
