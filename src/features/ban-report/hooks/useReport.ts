import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReport, ReportResponse } from "../services/report";
import { router } from "expo-router";
import { AxiosError } from "axios";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const { mutate, isPending, isError, error } = useMutation<
    ReportResponse,
    AxiosError<ApiErrorResponse>,
    SubmitReportVariables,
    unknown
  >({
    mutationFn: submitReport,
    onSuccess: (data) => {
      showModal({
        title: t("features.ban_report.hooks.use_report.modal_title_success"),
        children: t("features.ban_report.hooks.use_report.modal_message_success"),
        primaryButton: {
          text: t("features.auth.hooks.use_auth.common_confirm"),
          onClick: () => {
            hideModal();
            router.navigate("/home");
          },
        },
      });
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] }),
        queryClient.invalidateQueries({ queryKey: ["preview-history"] }),
        queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] }),
      ]);
    },
    onError: (error) => {
      console.error("신고 제출 중 오류 발생:", error);
      const errorMessage =
        error.response?.data?.message ||
        t("features.ban_report.hooks.use_report.default_error_message");
      showModal({
        title: t("features.ban_report.hooks.use_report.modal_title_error"),
        children: errorMessage,
        primaryButton: {
          text: t("features.auth.hooks.use_auth.common_confirm"),
          onClick: () => hideModal(),
        },
      });
    },
  });

  return { mutate, isLoading: isPending, isError, error };
}
