import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReport, ReportResponse } from "../services/report";
import { Alert } from "react-native";
import { router } from "expo-router";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  statusCode?: number;
  message?: string;
  error?: string;
}

interface SubmitReportVariables {
  userId: string;
  reason: string;
  description?: string;
  evidenceImages?: { uri: string; name: string; type: string }[];
}

export function useReport() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation<
    ReportResponse, // 성공 시 반환 타입
    AxiosError<ApiErrorResponse>, // 에러 시 반환 타입
    SubmitReportVariables, // mutate 함수에 전달될 변수 타입
    unknown // Context 타입 unknown
  >({
    mutationFn: submitReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["reports", data.reportedUserId],
      });
      Alert.alert("신고 접수", "신고가 성공적으로 접수되었습니다!", [
        { text: "확인", onPress: () => router.navigate("/home") },
      ]);
    },
    onError: (error) => {
      console.error("신고 제출 중 오류 발생:", error);
      const errorMessage =
        error.response?.data?.message ||
        "신고 제출에 실패했습니다. 다시 시도해주세요.";
      Alert.alert("신고 실패", errorMessage, [{ text: "확인" }]);
    },
  });

  return { mutate, isLoading: isPending, isError, error };
}
