import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../text";
import { useTranslation } from "react-i18next";
import { isJapanese } from "@/src/shared/libs/local";
import { JP_LEGAL_LINKS } from "@/src/shared/constants/jp-legal-links";

interface JpLegalLinksProps {
  variant?: 'home' | 'mypage';
}

export const JpLegalLinks: React.FC<JpLegalLinksProps> = ({ variant = 'home' }) => {
  const { t } = useTranslation();
  const isJP = isJapanese();

  if (!isJP) {
    return null;
  }

  const onClickLink = (link: string) => {
    Linking.openURL(link);
  };

  if (variant === 'mypage') {
    return (
      <View style={styles.container}>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.privacyPolicy)}>
            <Text style={styles.linkText}>
              {t("jp_legal.privacy_policy")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.commercialLaw)}>
            <Text style={styles.linkText}>
              {t("jp_legal.commercial_law")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.ageVerification)}>
            <Text style={styles.linkText}>
              {t("jp_legal.age_verification")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.termsOfService)}>
          <Text style={styles.linkText}>
            {t("jp_legal.terms_of_service")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.privacyCollection)}>
          <Text style={styles.linkText}>
            {t("jp_legal.privacy_collection")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.ageVerification)}>
          <Text style={styles.linkText}>
            {t("jp_legal.age_verification")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: 16,
  },
  linksRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  linkText: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 20,
    textDecorationLine: "underline",
  },
});
