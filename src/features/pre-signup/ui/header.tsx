import SmallTitle from '@/assets/icons/small-title.svg';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Text } from '@shared/ui';
import type React from 'react';
import { View } from 'react-native';

export const Header: React.FC = () => {
	return (
		<View className="flex-row justify-between items-start mb-4">
			<View className="flex-1 items-center">
				<View className="mb-2">
					<Text
						weight="light"
						size="sm"
						className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A3EA1] to-[#9D6FFF] whitespace-nowrap"
					>
						내 이상형을 찾는 가장 빠른 방법
					</Text>
				</View>

				<View className="mb-2">
					<IconWrapper width={200} className="text-primaryPurple">
						<SmallTitle />
					</IconWrapper>
				</View>
			</View>
		</View>
	);
};
