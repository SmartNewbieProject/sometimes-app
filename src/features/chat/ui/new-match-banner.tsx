import BackgroundHeartIcon from "@assets/icons/new-chat-banner-heart.svg";
import { semanticColors } from '../../../shared/constants/colors';
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import useChatRoomDetail from "../queries/use-chat-room-detail";
function NewMatchBanner() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useChatRoomDetail(id);
  const name = data?.partner.name ?? t('features.chat.ui.new_match_banner.default_name');
  return (
    <View style={styles.container}>
      <View style={{ position: "relative" }}>
        <BackgroundHeartIcon />
        <Image
          source={require("@assets/images/letter.png")}
          style={styles.letterImage}
        />
      </View>
      <Text style={styles.title}>
        {t('features.chat.ui.new_match_banner.congrats')} <Text style={[styles.title, styles.name]}>{name}</Text>{t('features.chat.ui.new_match_banner.matched')}
      </Text>
      <Text style={styles.subText}>{t('features.chat.ui.new_match_banner.mutual_interest')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 1,

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: semanticColors.brand.primary,
  },
  letterImage: {
    width: 34,
    top: 7,
    left: 8,
    height: 34,
    position: "absolute",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 27,
    color: semanticColors.text.primary,
  },
  name: {
    color: semanticColors.brand.primary,
    fontWeight: "800",
    fontFamily: "Pretendard-ExtraBold",
  },
  subText: {
    fontSize: 14,
    lineHeight: 21,
    color: semanticColors.text.disabled,
  },
});

export default NewMatchBanner;
