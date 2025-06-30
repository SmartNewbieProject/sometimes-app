import Loading from '@/src/features/loading';
import { Button } from '@shared/ui';
import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';
import { useCategory } from '../../hooks';

export const CategoryList = () => {
	const { categories, changeCategory, currentCategory, isLoading } = useCategory();

	return (
		<ScrollView horizontal>
			<Loading.Lottie title="카테고리를 불러오고 있어요" loading={isLoading}>
				<View className="flex flex-row w-full gap-x-[10px] mb-2">
					{categories.map((category) => (
						<Button
							size="sm"
							textColor={currentCategory === category.code ? 'white' : 'black'}
							variant={currentCategory === category.code ? 'primary' : 'outline'}
							key={category.code}
							onPress={() => {
								changeCategory(category.code);
							}}
							prefix={
								<Image
									source={{ uri: category.emojiUrl }}
									style={{
										width: 32,
										height: 32,
									}}
								/>
							}
							className="px-[10px]"
						>
							{category.displayName}
						</Button>
					))}
				</View>
			</Loading.Lottie>
		</ScrollView>
	);
};
