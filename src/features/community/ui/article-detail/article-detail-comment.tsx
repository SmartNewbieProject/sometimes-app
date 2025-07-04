import type React from 'react';
import { useMemo } from 'react';
import { View, Platform } from 'react-native';
import { Divider, Show, Text } from '@/src/shared/ui';
import { Dropdown, type DropdownItem } from '@/src/shared/ui/dropdown';
import type { Comment } from '../../types';
import { dayUtils } from '@/src/shared/libs';
import { useAuth } from '../../../auth';
import { UserProfile } from '../user-profile';
import type { UniversityName } from '@/src/shared/libs/univ';
import { useBoolean } from '@/src/shared/hooks/use-boolean';

interface ArticleDetailCommentProps {
	comment: Comment;
	onDelete: (id: string) => void;
	onUpdate: (id: string) => void;
}

export const ArticleDetailComment: React.FC<ArticleDetailCommentProps> = ({
	comment,
	onDelete,
	onUpdate,
}) => {
	const { my } = useAuth();
	const isAuthor = comment.author.id === my?.id;
	const { value: isDropdownOpen, toggle: toggleDropdown } = useBoolean();

	const dropdownItems: DropdownItem[] = useMemo(() => [
		{
			key: 'update',
			content: <Text textColor="black">수정</Text>,
			onPress: () => onUpdate(comment.id),
		},
		{
			key: 'delete',
			content: <Text textColor="black">삭제</Text>,
			onPress: () => onDelete(comment.id),
		},
	], [comment.id, onUpdate, onDelete]);

	return (
		<View key={comment.id} className="flex flex-col w-full">
			<View className="flex-row">
				<View className="flex-1">
					<UserProfile
						author={comment.author}
						universityName={comment.author.universityDetails.name as UniversityName}
						isOwner={isAuthor}
						comment={
							<View style={{ flex: 1, flexDirection: 'row' }}>
								<Text
									className="text-sm flex-1"
									textColor="black"
									style={{
										flexWrap: 'wrap',
										flexShrink: 1,
										lineHeight: Platform.OS === 'ios' ? 18 : 20
									}}
								>
									{comment.content}
								</Text>
							</View>
						}
						updatedAt={
							<Text className="text-sm" textColor="pale-purple">
								{dayUtils.formatRelativeTime(comment.updatedAt)}
							</Text>
						}
						hideUniv
					/>
				</View>

				<View className="flex-row items-center justify-between">
					<View className="px-[5px] py-[2px] rounded-[1px] gap-[4px] flex-row items-center">
						<Show when={isAuthor}>
							<Dropdown
								open={isDropdownOpen}
								items={dropdownItems}
							/>
						</Show>
					</View>
				</View>
			</View>

			<Divider.Horizontal className="mt-2 z-[-1]" />
		</View>
	);
};
