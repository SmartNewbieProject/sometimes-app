import { Linking, Platform, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "../text";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: 16,
    marginBottom: Platform.OS === "android" ? 32 : 16,
  },
  businessText: {
    color: "#888",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 20,
  },
  linkContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  linkText: {
    color: "#888",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 20,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationOffset: 4,
  },
});

export const BusinessInfo: React.FC = () => {
  const onClickLink = (link: string) => {
    Linking.openURL(link);
  };

  const businessRegistrationLink =
    "https://www.ftc.go.kr/bizCommPop.do?wrkr_no=4980502914";

  return (
    <View style={styles.container}>
      <Text style={styles.businessText}>
        상호명: 스마트 뉴비 | 사업장 소재지: 대전광역시 서구 갈마중로 7번길 42,
        4동 407호 | 대표: 전준영 | 사업자 등록번호: 498-05-02914 |
        통신판매업신고: 제 2025-대전유성-0530호 | 문의전화: 010-8465-2476 |
        이메일: notify@smartnewb.com |{" "}
        <TouchableOpacity
          onPress={() => onClickLink(businessRegistrationLink)}
        >
          <Text style={styles.linkText}>사업자정보확인</Text>
        </TouchableOpacity>{" "}
      </Text>
      <View style={styles.linkContainer}>
        <TouchableOpacity
          onPress={() =>
            onClickLink(
              "https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145"
            )
          }
        >
          <Text style={styles.linkText}>
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
          <Text style={styles.linkText}>
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
          <Text style={styles.linkText}>
            서비스 이용약관
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
