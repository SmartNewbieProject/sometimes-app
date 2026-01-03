import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation } from "@tanstack/react-query";
import { deleteRejectLike } from "../api";
import i18n from "@/src/shared/libs/i18n";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { MIXPANEL_EVENTS } from "@/src/shared/constants/mixpanel-events";

function useRejectLike() {
  const { showErrorModal } = useModal();
  const mutation = useMutation({
    mutationFn: (connectionId: string) => deleteRejectLike(connectionId),
    onSuccess: async (_data, connectionId) => {
      mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_REJECTED, {
        source_profile_id: connectionId,
        timestamp: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] });
    },
    onError: () => {
      showErrorModal(i18n.t("features.post-box.queries.use_reject_like.error_message"), "error");
    },
  });
  return mutation;
}

export default useRejectLike;
