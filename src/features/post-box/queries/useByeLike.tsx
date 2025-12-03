import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { deleteByeLike, deleteRejectLike } from "../api";
import { useTranslation } from "react-i18next";

function useByeLike() {
  const { showErrorModal } = useModal();
  const { t } = useTranslation();
  const mutataion = useMutation({
    mutationFn: (connectionId: string) => deleteByeLike(connectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] });
    },
    onError: () => {
      showErrorModal(t("features.post-box.queries.use_bye_like.error_message"), "error");
    },
  });
  return mutataion;
}

export default useByeLike;
