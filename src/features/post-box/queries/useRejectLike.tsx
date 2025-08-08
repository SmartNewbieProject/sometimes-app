import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { deleteRejectLike } from "../api";

function useRejectLike() {
  const { showErrorModal } = useModal();
  const mutataion = useMutation({
    mutationFn: (connectionId: string) => deleteRejectLike(connectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] });
    },
    onError: () => {
      showErrorModal("서버 내부 오류로 좋아요 거절에 실패하였습니다.", "error");
    },
  });
  return mutataion;
}

export default useRejectLike;
