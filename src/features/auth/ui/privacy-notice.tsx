import colors from "@constants/colors";
import { Text } from "@ui/text";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";

const PRIVACY_LINK =
  "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145";
const SERVICE_LINK =
  "https://ruby-composer-6d2.notion.site/1cd1bbec5ba1805dbafbc9426a0aaa80";
const ENTERPIRSE_LINK = "http://www.ftc.go.kr/bizCommPop.do?wrkr_no=4980502914";
const PRIVACY_POLICY_LINK =
  "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180c6b987ff2dcd75fa15";
export const PrivacyNotice = () => (
  <View className="flex flex-col w-full items-center">
    <Text textColor="gray" className="text-[12px]">
      회원가입 및 로그인 버튼을 누르면
    </Text>

    <View className="flex flex-row">
      <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_LINK)}>
        <Text
          style={{
            ...styles.link,
            marginRight: 2,
          }}
        >
          개인정보 보호 약관,
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(SERVICE_LINK)}>
        <Text style={{ ...styles.link, marginRight: 2 }}>서비스 이용약관,</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_LINK)}>
        <Text style={{ ...styles.link }}>개인정보 수집 및 이용동의</Text>
      </TouchableOpacity>
    </View>
    <Text textColor="gray" className="text-[12px]">
      에 동의하게 됩니다.
    </Text>

    <TouchableOpacity onPress={() => Linking.openURL(ENTERPIRSE_LINK)}>
      <Text
        style={{
          ...styles.link,
          marginTop: 10,
          color: colors.gray,
        }}
      >
        스마트 뉴비 사업자 정보 {">"}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  link: {
    textDecorationLine: "underline",
    fontSize: 12,
    color: colors["gray-600"],
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
  },
});
