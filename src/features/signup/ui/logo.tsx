import LogoIcon from '@/assets/icons/paper-plane.svg';
import SmallTitle from '@/assets/icons/small-title.svg';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export default function Logo() {
	return (
		<View
			className={cn(
				'flex flex-col items-center gap-y-2',
				platform({
					ios: () => 'pt-[80px]',
					android: () => 'pt-[80px]',
					web: () => '',
				}),
			)}
		>
			<IconWrapper width={128} className="text-primaryPurple md:pb-[58px]">
				<SmallTitle />
			</IconWrapper>
			<View className="p-0 md:p-12 mt-[8px]">
				<Image
					source={require('@assets/images/paper-plane.png')}
					style={{ width: 128, height: 128 }}
				/>
			</View>
			<View className="items-center pt-[8px] flex flex-col gap-y-[6px]">
				<Text className="text-[25px] font-semibold text-black">익숙한 하루에 설렘 하나,</Text>
				<Text className="text-[15px] text-[#4F4F4F]">SOMETIME에서</Text>
			</View>
		</View>
	);
}
