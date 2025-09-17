import { View } from "react-native";
import { Text } from '@shared/ui';
import { useTranslation } from "react-i18next";

export const CommunityGuideline = () => {
  const { t } = useTranslation();
  return (
  <View className="pl-[16px] pr-[10px]">
    <Text className="text-[14px] text-[#7C7C7C] opacity-60 leading-[17.6px] pb-[9px]">{t("features.community.ui.guideline.title")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 leading-[17.6px] pb-[9px]">{t("features.community.ui.guideline.welcome_message")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[26px]">{t("features.community.ui.guideline.guideline_purpose")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.basic_rules_title")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.rule_1")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.rule_2")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.rule_3")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.rule_4")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[26px]">{t("features.community.ui.guideline.writing_tips_title")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.tip_1")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.tip_2")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.tip_3")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[26px]">{t("features.community.ui.guideline.tip_4")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[9px]">{t("features.community.ui.guideline.report_and_sanction_title")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[8px] ">{t("features.community.ui.guideline.sanction_message_1")}</Text>
    <Text className="text-[12px] text-[#7C7C7C] opacity-60 pb-[8px] ">{t("features.community.ui.guideline.sanction_message_2")}</Text>
  </View>
);
