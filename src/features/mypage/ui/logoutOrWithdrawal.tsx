import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/shared/ui";
import { useAuth } from "@/src/features/auth";

const LogoutOrWithdrawal = () => {
  const { logout } = useAuth();
  return (
    <View className="w-full">
        <Text className="text-[18px] text-black font-weight-500">계정 관리</Text>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }} className="mt-[5px] mb-[10px]" />
    <View className="flex-row justify-center items-center gap-[100px]">
        <TouchableOpacity onPress={logout}>
            <Text className="text-[15px] font-medium text-black">로그아웃</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity>
            <Text className="text-[15px] font-medium text-[#FF0000]">회원탈퇴</Text>
        </TouchableOpacity> */}
    </View>
    </View>
  );
};

export default LogoutOrWithdrawal;
