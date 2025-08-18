import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { deleteByeLike, deleteRejectLike } from "../api";

function useByeLike() {
  const { showErrorModal } = useModal();
  const mutataion = useMutation({
    mutationFn: (connectionId: string) => deleteByeLike(connectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] });
    },
    onError: () => {
      showErrorModal("서버 내부 오류로 인연 삭제에 실패하였습니다.", "error");
    },
  });
  return mutataion;
}

export default useByeLike;
