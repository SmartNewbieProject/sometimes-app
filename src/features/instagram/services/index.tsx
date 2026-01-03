import { Linking, Alert } from "react-native";
import i18n from "@/src/shared/libs/i18n";

export const openInstagram = async (instagramId: string) => {
  if (!instagramId) {
    Alert.alert(
      i18n.t('features.instagram.services.alert_title'),
      i18n.t('features.instagram.services.no_instagram_id')
    );
    return;
  }

  const username = instagramId.replace(/^@/, '').trim();
  const instagramProfileUrl = `https://www.instagram.com/${username}`;

  try {
    await Linking.openURL(instagramProfileUrl);
  } catch (error) {
    console.error('Instagram connection error:', error);
    Alert.alert(
      i18n.t('features.instagram.services.error_title'),
      i18n.t('features.instagram.services.connection_error')
    );
  }
};
