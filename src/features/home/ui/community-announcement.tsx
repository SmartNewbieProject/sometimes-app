import { Text } from '@/src/shared/ui';
import PurpleRightArrow from '@assets/icons/purple-arrow.svg';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../auth';

export const CommunityAnnouncement = () => {
	const { profileDetails } = useAuth();

	return (
		<TouchableOpacity
			className="flex flex-row items-center justify-between"
			onPress={() => router.navigate('/community')}
		>
			<View className="my-[25px]">
				<Text textColor="black" className="font-bold text-[18px]" weight="medium">
					{profileDetails?.name}님도 가능해요
				</Text>
				<Text textColor="black" className="font-bold text-[18px]" weight="medium">
					연애 성공 후기, 한번 확인해 보세요!
				</Text>
			</View>
			<View className="mt-4">
				<PurpleRightArrow />
			</View>
		</TouchableOpacity>
	);
};
