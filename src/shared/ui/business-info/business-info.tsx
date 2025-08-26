import { Linking, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "../text";

export const BusinessInfo: React.FC = () => {
  const onClickLink = (link: string) => {
    Linking.openURL(link);
  };

  const businessRegistrationLink =
    "https://www.ftc.go.kr/bizCommPop.do?wrkr_no=4980502914";

  return (
    <View
      className={`w-full flex flex-col items-center px-4 py-6 mt-4 ${
        Platform.OS === "android" ? "mb-8" : "mb-4"
      }`}
    >
      <Text className="text-[#888] text-[10px] text-center leading-5">
        상호명: 스마트 뉴비 | 사업장 소재지: 대전광역시 서구 갈마중로 7번길 42,
        4동 407호 | 대표: 전준영 |{" "}
        <TouchableOpacity
          onPress={() => onClickLink(businessRegistrationLink)}
          className="underline inderline-offset-1"
        >
          <Text className="text-[#888] text-[10px]">
            사업자 등록번호: 498-05-02914
          </Text>
        </TouchableOpacity>{" "}
        | 통신판매업신고: 제 2025-대전유성-0530호 | 문의전화: 010-8465-2476 |
        이메일: notify@smartnewb.com | 사업자정보
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
            개인정보처리방침
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
            개인정보 수집 및 이용동의
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
            서비스 이용약관
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
