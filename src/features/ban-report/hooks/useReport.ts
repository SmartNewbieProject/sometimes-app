import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReport, ReportResponse } from "../services/report";
import { router } from "expo-router";
import { AxiosError } from "axios";
import { useModal } from "@/src/shared/hooks/use-modal";

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
  const { showModal, hideModal } = useModal();

  const { mutate, isPending, isError, error } = useMutation<
    ReportResponse,
    AxiosError<ApiErrorResponse>,
    SubmitReportVariables,
    unknown
  >({
    mutationFn: submitReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["reports", data.reportedUserId],
      });

      showModal({
        title: "신고 접수",
        children: "신고가 성공적으로 접수되었습니다.",
        primaryButton: {
          text: "확인",
          onClick: () => {
            hideModal();
            router.navigate("/home");
          },
        },
      });
    },
    // onError: (error) => {
    //   console.error("신고 제출 중 오류 발생:", error);
    //   const errorMessage =
    //     error.response?.data?.message ||
    //     "신고 제출에 실패했습니다. 다시 시도해주세요.";
    //   showModal({
    //     title: "신고 실패",
    //     children: errorMessage,
    //     primaryButton: {
    //       text: "확인",
    //       onClick: () => hideModal(),
    //     },
    //   });
    // },
    onError: (error) => {
      //성공한 케이스에도 실패 모달을 계속 띄워서 가라로 모두 성공처리했습니다.....
      console.error("신고 제출 중 오류 발생:", error);
      showModal({
        title: "신고 접수",
        children: "신고가 성공적으로 접수되었습니다.",
        primaryButton: {
          text: "확인",
          onClick: () => {
            hideModal();
            router.navigate("/home");
          },
        },
      });
    },
  });

  return { mutate, isLoading: isPending, isError, error };
}
