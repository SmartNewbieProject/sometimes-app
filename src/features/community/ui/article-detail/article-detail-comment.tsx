import { View, Modal, TouchableOpacity, findNodeHandle, UIManager } from 'react-native';
import { dropdownStyles, Divider, Show, Text } from '@/src/shared/ui';
import type { Comment } from '../../types';
import { dayUtils } from '@/src/shared/libs';
import { useAuth } from '../../../auth';
import { UserProfile } from '../user-profile';
import type { UniversityName } from '@/src/shared/libs/univ';
import { useBoolean } from '@/src/shared/hooks/use-boolean';
import { ImageResource } from '@/src/shared/ui/image-resource';
import { ImageResources } from '@/src/shared/libs';
import { useRef, useState } from 'react';

export const ArticleDetailComment = ({
	comment,
	onDelete,
	onUpdate,
}: {
	comment: Comment;
	onDelete: (id: string) => void;
	onUpdate: (id: string) => void;
}) => {
	const { my } = useAuth();
	const isAuthor = comment.author.id === my?.id;
	const { value: isDropdownOpen, toggle: toggleDropdown, setFalse: closeDropdown } = useBoolean();
	const menuButtonRef = useRef<TouchableOpacity>(null); // ✅ ref 추가
	const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });

	const showDropdown = () => {
		const handle = findNodeHandle(menuButtonRef.current);
		if (handle) {
			UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
				setDropdownPos({
					x: pageX - 140 + width, // 드롭다운 너비 고려해서 왼쪽 아래 위치
					y: pageY + height,
				});
				toggleDropdown();
			});
		}
	};

	return (
		<View key={comment.id} className="flex flex-col w-full">
			<View className="flex-row">
				<View className="flex-1">
					<UserProfile
						author={comment.author}
						universityName={comment.author.universityDetails.name as UniversityName}
						isOwner={isAuthor}
						comment={
							<Text className="text-sm" textColor="black">
								{comment.content}
							</Text>
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
							<TouchableOpacity
								ref={menuButtonRef}
								onPress={(e) => {
									e.stopPropagation();
									showDropdown(); // ✅ 위치 측정 후 드롭다운 토글
								}}
							>
								<View className="w-[48px] h-[48px] flex items-center justify-center">
									<ImageResource resource={ImageResources.MENU} width={24} height={24} />
								</View>
							</TouchableOpacity>
						</Show>
					</View>
				</View>
			</View>

			<Modal visible={isDropdownOpen} transparent onRequestClose={closeDropdown}>
				<TouchableOpacity
					style={{
						flex: 1,
						backgroundColor: 'transparent',
					}}
					activeOpacity={1}
					onPress={closeDropdown}
				>
					<View
						style={[
							dropdownStyles.dropdownContainer,
							{
								position: 'absolute',
								top: dropdownPos.y,
								left: dropdownPos.x,
								width: 140,
								backgroundColor: 'white',
								borderRadius: 8,
								elevation: 3,
								zIndex: 9999,
							},
						]}
					>
						<TouchableOpacity
							style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
							onPress={(e) => {
								e.stopPropagation();
								closeDropdown();
								onUpdate(comment.id);
							}}
						>
							<Text textColor="black">수정</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={{ padding: 10 }}
							onPress={(e) => {
								e.stopPropagation();
								onDelete(comment.id);
								closeDropdown();
							}}
						>
							<Text textColor="black">삭제</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>

			<Divider.Horizontal className="mt-2 z-[-1]" />
		</View>
	);
};
