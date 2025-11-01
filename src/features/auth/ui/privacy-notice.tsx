import colors from "@constants/colors";
import { Text } from "@ui/text";
import { useState } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppleReviewModal } from "./apple-review-modal";
import { useTranslation } from "react-i18next";
import { useAppFont } from "@/src/shared/hooks/use-app-font";

const PRIVACY_LINK =
  "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145";
const SERVICE_LINK =
  "https://ruby-composer-6d2.notion.site/1cd1bbec5ba1805dbafbc9426a0aaa80";
const ENTERPIRSE_LINK = "http://www.ftc.go.kr/bizCommPop.do?wrkr_no=4980502914";
const PRIVACY_POLICY_LINK =
  "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180c6b987ff2dcd75fa15";
export const PrivacyNotice = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation();
  console.log(t("features.auth.ui.privacy_notice.notice_prefix"));
  return (
    <View className="flex flex-col w-full items-center">
      <Text textColor="gray" className="text-[12px]">
        {t("features.auth.ui.privacy_notice.notice_prefix")}
      </Text>

      <View className="flex flex-row">
        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_LINK)}>
          <Text
            style={{
              ...styles.link,
              marginRight: 2,
            }}
          >
            {t("features.auth.ui.privacy_notice.privacy_terms")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(SERVICE_LINK)}>
          <Text style={{ ...styles.link, marginRight: 2 }}>
            {t("features.auth.ui.privacy_notice.service_terms")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_LINK)}>
          <Text style={{ ...styles.link }}>{t("features.auth.ui.privacy_notice.collection_agreement")}</Text>
        </TouchableOpacity>
      </View>
      <Text textColor="gray" className="text-[12px]">
        {t("features.auth.ui.privacy_notice.notice_suffix")}
      </Text>

      <TouchableOpacity onPress={() => Linking.openURL(ENTERPIRSE_LINK)}>
        <Text
          style={{
            ...styles.link,
            marginTop: 10,
            color: colors.gray,
          }}
        >
          {t("features.auth.ui.privacy_notice.business_info")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Text
          style={{
            ...styles.link,
            marginTop: 10,
            color: colors.gray,
          }}
        >
          Log in with Review Account
        </Text>
      </TouchableOpacity>
      <AppleReviewModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  link: {
    textDecorationLine: "underline",
    fontSize: 12,
    color: colors["gray-600"],
    fontFamily: useAppFont("semibold"),
    fontWeight: 600,
  },
});
