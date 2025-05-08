import { View } from 'react-native';
import { Divider, Show, Text } from '@/src/shared/ui';
import type { Comment } from '../../types';
import { dayUtils } from '@/src/shared/libs';
import { useAuth } from '../../../auth';
import { UserProfile } from '../user-profile';
import type { UniversityName } from '@/src/shared/libs/univ';
import { Dropdown } from '@/src/shared/ui/dropdown';

export const ArticleDetailComment = ({
	comment,
	onDelete,
	onUpdate,
}: { comment: Comment; onDelete: (id: string) => void; onUpdate: (id: string) => void }) => {
	const { my } = useAuth();
	const isAuthor = comment.author.id === my?.id;

	return (
		<View key={comment.id} className="flex flex-col w-full">
		<View className="flex-row">
			<View className="flex-1">
				<UserProfile
					author={comment.author}
					universityName={comment.author.universityDetails.name as UniversityName}
					isOwner={isAuthor}
					comment={<Text className="text-sm" textColor="black">{comment.content}</Text>}
					updatedAt={<Text className="text-sm" textColor="pale-purple">{dayUtils.formatRelativeTime(comment.updatedAt)}</Text>}
					hideUniv
				/>
			</View>

			<View className="flex-row items-center justify-between">
				<View className="px-[5px] py-[2px] rounded-[1px] gap-[4px] flex-row items-center">
					{/* TODO: 신고 추후 연동 */}
					{/* <Show when={!isAuthor}>
						<TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
							<Text className="text-[10px] text-[#A892D7]">신고</Text>
						</TouchableOpacity>
					</Show> */}
					<Show when={isAuthor}>
						<Dropdown
							open={false}
							dropdownStyle={{ top: 20, right: 18 }}
							items={[
								{
									key: 'edit',
									content: <Text textColor="black">수정</Text>,
									onPress: () => onUpdate(comment.id),
								},
								{
									key: 'delete',
									content: <Text textColor="black">삭제</Text>,
									onPress: () => onDelete(comment.id),
								},
							]}
						/>
					</Show>
				</View>
			</View>
		</View>

		<Divider.Horizontal className="mt-2" />
		</View>
	);
};
