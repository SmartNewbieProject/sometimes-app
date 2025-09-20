import { Linking, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "../text";
import { useTranslation } from "react-i18next";

export const BusinessInfo: React.FC = () => {
  const onClickLink = (link: string) => {
    Linking.openURL(link);
  };

  const { t } = useTranslation(); 
  const businessRegistrationLink =
    "https://www.ftc.go.kr/bizCommPop.do?wrkr_no=4980502914";

  return (
    <View
      className={`w-full flex flex-col items-center px-4 py-6 mt-4 ${
        Platform.OS === "android" ? "mb-8" : "mb-4"
      }`}
    >
      <Text className="text-[#888] text-[10px] text-center leading-5">
        {t("shareds.business_info.company_info")}{" "}
        <TouchableOpacity
          onPress={() => onClickLink(businessRegistrationLink)}
          className="underline inderline-offset-1"
        >
          <Text className="text-[#888] text-[10px]">
            {t("shareds.business_info.registration_number")}
          </Text>
        </TouchableOpacity>{" "}
        {t("shareds.business_info.sales_report")}
      </Text>
      <View className="flex flex-row gap-x-2 items-center justify-center w-full">
        <TouchableOpacity
          onPress={() =>
            onClickLink(
              "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145"
            )
          }
        >
          <Text className="text-[#888] text-[10px] text-center leading-5  underline underline-offset-1">
            {t("shareds.business_info.privacy_policy")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            onClickLink(
              "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145?pvs=7"
            )
          }
        >
          <Text className="text-[#888] text-[10px] text-center leading-5  underline underline-offset-1">
            {t("shareds.business_info.data_consent")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            onClickLink(
              "https://ruby-composer-6d2.notion.site/1cd1bbec5ba1805dbafbc9426a0aaa80"
            )
          }
        >
          <Text className="text-[#888] text-[10px] text-center leading-5  underline underline-offset-1">
            {t("shareds.business_info.terms_of_service")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
