import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { deleteRejectLike } from "../api";
import i18n from "@/src/shared/libs/i18n";

function useRejectLike() {
  const { showErrorModal } = useModal();
  const mutataion = useMutation({
    mutationFn: (connectionId: string) => deleteRejectLike(connectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] });
    },
    onError: () => {
      showErrorModal(i18n.t("features.post-box.queries.use_reject_like.error_message"), "error");
    },
  });
  return mutataion;
}

export default useRejectLike;
