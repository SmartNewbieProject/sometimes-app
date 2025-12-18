import { useQuery } from "@tanstack/react-query";
import { matchHistoryApis } from "../apis";
import { useEffect } from "react";
import { HttpStatusCode } from "axios";
import { useModal } from "@/src/shared/hooks/use-modal";
import { View, StyleSheet } from "react-native";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export const useMatchPartnerQuery = (matchId?: string) => {
  const queryResults = useQuery({
    enabled: !!matchId,
    queryKey: ['match-partner', matchId],
    queryFn: () => matchHistoryApis.getPartnerByMatchId(matchId!),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
  const { showModal } = useModal();

  const { t } = useTranslation();

  const onClickConfirm = () => {
    // TODO: 열람권 처리하기
    router.back();
  };

  useEffect(() => {
    if (!queryResults.error) return;
    const { error, status } = queryResults.error as unknown as { error: string, status: number };
    if (status === HttpStatusCode.BadRequest) {
      showModal({
        title: t('features.match.queries.modal_title_period_ended'),
        children: (
          <View style={modalStyles.container}>
            <Text textColor="black" size="sm">
              {t('features.match.queries.modal_content_partner_period_ended')}
            </Text>
            <Text textColor="black" size="sm">
              {t('features.match.queries.modal_content_use_rematching_ticket')}
            </Text>
          </View>
        ),
        primaryButton: {
          text: t('features.match.queries.modal_button_confirm'),
          onClick: onClickConfirm,
        }
      });
      return;
    }

  }, [queryResults.error]);

  return queryResults;
}

const modalStyles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
});
