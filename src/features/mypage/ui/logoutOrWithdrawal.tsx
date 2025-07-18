import { useAuth } from "@/src/features/auth";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const LogoutOrWithdrawal = () => {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>계정 관리</Text>
      <View style={styles.bar} />
      <View className="flex-row justify-center items-center gap-[100px]">
        <TouchableOpacity onPress={logout}>
          <Text className="text-[15px] font-medium text-black">로그아웃</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => router.navigate("/my/withdrawal")}
        className="mt-[36px] mb-[64px] w-full flex justify-center flex-row"
      >
        <Text className="text-[14px] font-light underline underline-offset-1 text-gray-300">
          회원을 탈퇴하고 싶어요.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: "#000",
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 21.6,
  },
  bar: {
    marginTop: 5,
    marginBottom: 10,
    height: 1,
    width: "100%",
    backgroundColor: "#E7E9EC",
  },
  contentContainer: {
    gap: 10,
    paddingHorizontal: 2,
  },
});

export default LogoutOrWithdrawal;
