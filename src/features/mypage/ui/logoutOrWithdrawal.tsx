import { useAuth } from '@/src/features/auth';
import { Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

const LogoutOrWithdrawal = () => {
	const { logout } = useAuth();
	return (
		<View className="w-full">
			<Text className="text-[18px] text-black font-weight-500">계정 관리</Text>
			<View
				style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}
				className="mt-[5px] mb-[10px]"
			/>
			<View className="flex-row justify-center items-center gap-[100px]">
				<TouchableOpacity onPress={logout}>
					<Text className="text-[15px] font-medium text-black">로그아웃</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				activeOpacity={0.5}
				onPress={() => router.navigate('/my/withdrawal')}
				className="mt-[36px] mb-[64px] w-full flex justify-center flex-row"
			>
				<Text className="text-[14px] font-light underline underline-offset-1 text-gray-300">
					회원을 탈퇴하고 싶어요.
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default LogoutOrWithdrawal;
