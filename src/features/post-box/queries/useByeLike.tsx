import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation } from "@tanstack/react-query";
import { deleteByeLike } from "../api";
import { useTranslation } from "react-i18next";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { MIXPANEL_EVENTS } from "@/src/shared/constants/mixpanel-events";

function useByeLike() {
  const { showErrorModal } = useModal();
  const { t } = useTranslation();
  const mutation = useMutation({
    mutationFn: (connectionId: string) => deleteByeLike(connectionId),
    onSuccess: async (_data, connectionId) => {
      mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_CANCELLED, {
        target_profile_id: connectionId,
        timestamp: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ["liked", "of-me"] });
      await queryClient.invalidateQueries({ queryKey: ["liked", "to-me"] });
    },
    onError: () => {
      showErrorModal(t("features.post-box.queries.use_bye_like.error_message"), "error");
    },
  });
  return mutation;
}

export default useByeLike;
