import { ImageResources } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import { View } from 'react-native';

export const NotFound = () => {
	return (
		<View className="w-full h-full flex justify-center items-center">
			<ImageResource resource={ImageResources.BROKEN_SANDTIMER} width={214} height={214} />
			<Text textColor="purple" weight="semibold">
				매칭에 실패했어요
			</Text>

			<View className="flex flex-col mt-4 w-full px-14">
				<Text className="text-[#8e74c5]">왜 매칭에 실패하나요?</Text>

				<View className="flex flex-col mt-1.5">
					<Text className="text-[#8e74c5]" size="13">
						1. 서로 잘 맞는 분들을 우선 연결해드리다 보니 매칭이 보류 될 수 있어요.
					</Text>
					<Text className="text-[#8e74c5]" size="13">
						2. 성비 불균형으로 매칭 기회가 제한 되는 경우가 있어요.
					</Text>
					<Text className="text-[#8e74c5]" size="13">
						3. 프로필 정보 문제, 커뮤니티 신고 등으로 매칭이 제한 될 수 있어요.
					</Text>
				</View>
			</View>
		</View>
	);
};
