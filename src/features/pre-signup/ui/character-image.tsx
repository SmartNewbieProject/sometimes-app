import { ImageResources } from '@/src/shared/libs/image';
import { ImageResource } from '@shared/ui';
import type React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

interface CharacterImageProps {
	style?: any;
}

export const CharacterImage: React.FC<CharacterImageProps> = ({ style }) => {
	return (
		<Animated.View className="w-full flex items-center justify-center" style={style}>
			<View
				style={{
					width: '100%',
					maxWidth: 400,
					aspectRatio: 1 / 1.125,
					overflow: 'hidden',
				}}
			>
				<ImageResource
					resource={ImageResources.PRE_SIGNUP_CHARACTER}
					contentFit="contain"
					loadingTitle="캐릭터 이미지 로딩 중..."
					style={{
						width: '100%',
						height: '100%',
						maxWidth: '100%',
					}}
					className="w-full h-full"
				/>
			</View>
		</Animated.View>
	);
};
