import AreaFillHeart from '@/assets/icons/area-fill-heart.svg';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useBoolean } from '@/src/shared/hooks/use-boolean';
import { dayUtils } from '@/src/shared/libs';
import type { UniversityName } from '@/src/shared/libs/univ';
import { LinkifiedText, Show, Text } from '@/src/shared/ui';
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Image,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import { useAuth } from '../../../auth';
import type { Comment } from '../../types';
import { UserProfile } from '../user-profile';

const ADMIN_COMMENT_LABEL_EMOJI = '💜';

interface ArticleDetailCommentProps {
	comment: Comment;
	isEditing?: boolean;
	onDelete: (id: string) => void;
	onUpdate: (id: string) => void;
	onReply?: (parentId: string) => void;
	onLike: (commentId: string) => void;
	isReply?: boolean;
	rootParentId?: string;
	hideBottomBorder?: boolean;
	articleAuthorId?: string;
}

export const ArticleDetailComment: React.FC<ArticleDetailCommentProps> = ({
	comment,
	onDelete,
	onUpdate,
	onReply,
	onLike,
	isEditing = false,
	isReply = false,
	rootParentId,
	hideBottomBorder = false,
	articleAuthorId,
}) => {
	const { my } = useAuth();
	const { t } = useTranslation();
	const isAuthor = comment.author.id === my?.id;
	const isStaffComment = comment.author.isStaff === true;
	const isArticleAuthor = articleAuthorId ? comment.author.id === articleAuthorId : false;
	const { value: isMenuOpen, setFalse: closeMenu, setTrue: openMenu } = useBoolean();
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
	const containerRef = useRef<View>(null);

	const handleToggleMenu = () => {
		if (!isMenuOpen && containerRef.current) {
			containerRef.current.measure((_fx, _fy, width, height, px, py) => {
				setDropdownPosition({
					top: py + height + 4,
					right: px + width - 80,
				});
			});
			openMenu();
		} else {
			closeMenu();
		}
	};

	const handleUpdate = () => {
		onUpdate(comment.id);
		closeMenu();
	};

	const handleDelete = () => {
		onDelete(comment.id);
		closeMenu();
	};

	const renderActionButtons = () => (
		<View style={isStaffComment ? styles.staffActionButtons : styles.actionButtons}>
			<TouchableOpacity style={styles.actionButton} onPress={() => onLike(comment.id)}>
				{comment.isLiked ? (
					<AreaFillHeart width={18} height={18} />
				) : (
					<Image
						source={require('@/assets/icons/heart.png')}
						style={{ width: 18, height: 16, tintColor: '#676767' }}
					/>
				)}
				{comment.likeCount > 0 && <Text style={styles.actionCountText}>{comment.likeCount}</Text>}
			</TouchableOpacity>
			<View style={styles.actionDivider} />
			<Show when={isAuthor}>
				<TouchableWithoutFeedback onPress={handleToggleMenu}>
					<View ref={containerRef} style={styles.actionButton}>
						<Image
							source={require('@/assets/icons/menu-dots-vertical.png')}
							style={{ width: 18, height: 18 }}
						/>
					</View>
				</TouchableWithoutFeedback>
			</Show>
			<Show when={!isAuthor && !!onReply}>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => onReply?.(rootParentId || comment.id)}
				>
					<Image
						source={require('@/assets/icons/engagement.png')}
						style={{ width: 16, height: 16 }}
					/>
				</TouchableOpacity>
			</Show>
		</View>
	);

	return (
		<View
			key={comment.id}
			style={[
				styles.container,
				isStaffComment && styles.staffContainer,
				isArticleAuthor && !isStaffComment && styles.articleAuthorContainer,
				{
					backgroundColor: isEditing
						? colors.moreLightPurple
						: isStaffComment
							? 'rgba(247, 243, 255, 0.4)'
							: isArticleAuthor
								? '#f8f4ff'
								: colors.white,
					...(isStaffComment || isArticleAuthor
						? {}
						: { borderBottomWidth: hideBottomBorder ? 0 : 1 }),
				},
			]}
		>
			{isStaffComment && (
				<View style={styles.staffHeaderRow}>
					<View style={styles.staffLabelContainer}>
						<Text style={styles.staffLabelText}>
							{t('features.community.ui.article_detail.staff_comment_label')}{' '}
							{ADMIN_COMMENT_LABEL_EMOJI}
						</Text>
					</View>
					{renderActionButtons()}
				</View>
			)}

			<View style={[styles.row, isReply && !isStaffComment && styles.replyPadding]}>
				{isReply && !isStaffComment && (
					<View style={styles.replyIcon}>
						<Image
							source={require('@/assets/icons/reply.png')}
							style={styles.replyImage}
							resizeMode="contain"
						/>
					</View>
				)}

				<View style={styles.flex1}>
					<View style={isStaffComment ? styles.staffContentWrapper : styles.contentWrapper}>
						<UserProfile
							author={comment.author}
							universityName={comment.author.universityDetails.name as UniversityName}
							isOwner={isAuthor}
							isArticleAuthor={isArticleAuthor}
							updatedAt={
								isStaffComment ? undefined : (
									<View style={styles.metaRow}>
										<Text size={'sm'} textColor="pale-purple">
											{dayUtils.formatRelativeTime(comment.updatedAt)}
										</Text>
										{comment.likeCount > 0 && (
											<View style={styles.likeCountRow}>
												<AreaFillHeart width={14} height={14} />
												<Text size={'sm'} textColor="pale-purple">
													{comment.likeCount}
												</Text>
											</View>
										)}
									</View>
								)
							}
							hideUniv
						/>

						{!isStaffComment && (
							<View style={styles.actionButtonsContainer}>{renderActionButtons()}</View>
						)}

						<Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
							<TouchableWithoutFeedback onPress={closeMenu}>
								<View style={{ flex: 1, backgroundColor: 'transparent' }}>
									<TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
										<View
											style={{
												position: 'absolute',
												top: dropdownPosition.top,
												left: dropdownPosition.right,
												width: 80,
												paddingVertical: 4,
												borderRadius: 8,
												backgroundColor: semanticColors.surface.background,
												shadowColor: '#000',
												shadowOffset: { width: 0, height: 4 },
												shadowOpacity: 0.1,
												shadowRadius: 8,
												elevation: 8,
												borderWidth: 1,
												borderColor: semanticColors.border.default,
											}}
										>
											<Pressable
												onPress={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleUpdate();
												}}
												style={{
													paddingHorizontal: 12,
													paddingVertical: 8,
													borderBottomWidth: 1,
													borderBottomColor: '#f5f5f5',
													backgroundColor: semanticColors.surface.background,
												}}
											>
												<Text size="sm" textColor="black">
													{t('features.community.ui.article_detail.edit_button')}
												</Text>
											</Pressable>
											<Pressable
												onPress={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleDelete();
												}}
												style={{
													paddingHorizontal: 12,
													paddingVertical: 8,
													backgroundColor: semanticColors.surface.background,
												}}
											>
												<Text size="sm" textColor="black">
													{t('features.community.ui.article_detail.delete_button')}
												</Text>
											</Pressable>
										</View>
									</TouchableWithoutFeedback>
								</View>
							</TouchableWithoutFeedback>
						</Modal>

						<View style={isStaffComment ? styles.staffCommentBody : styles.commentBody}>
							<LinkifiedText
								textColor="black"
								style={[styles.commentText, { lineHeight: Platform.OS === 'ios' ? 18 : 20 }]}
							>
								{comment.content}
							</LinkifiedText>
						</View>

						{isStaffComment && (
							<View style={styles.staffTimestampContainer}>
								<Text size={'sm'} textColor="pale-purple">
									{dayUtils.formatRelativeTime(comment.updatedAt)}
								</Text>
							</View>
						)}
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		paddingVertical: 12,
		flexDirection: 'column',
		width: '100%',
		borderBottomWidth: 1,
		borderBottomColor: semanticColors.border.default,
	},
	staffContainer: {
		paddingHorizontal: 16,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: semanticColors.surface.other,
		marginBottom: 12,
		backgroundColor: '#f8f4ff',
	},
	articleAuthorContainer: {
		paddingHorizontal: 16,
		borderRadius: 15,
		marginBottom: 12,
	},
	staffHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	staffLabelContainer: {
		alignSelf: 'flex-start',
		backgroundColor: '#e6dbff',
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 15,
	},
	staffLabelText: {
		fontSize: 8.4,
		fontWeight: '600',
		color: '#7a4ae2',
	},
	staffActionButtons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: '#ffffff',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	row: {
		flexDirection: 'row',
	},
	replyPadding: {
		paddingLeft: 35,
	},
	replyIcon: {
		marginRight: 8,
		marginTop: 4,
	},
	replyImage: {
		width: 15,
		height: 16,
	},
	flex1: {
		flex: 1,
	},
	contentWrapper: {
		position: 'relative',
		paddingHorizontal: 8,
	},
	staffContentWrapper: {
		position: 'relative',
	},
	commentBody: {
		flex: 1,
		flexDirection: 'row',
		paddingLeft: 36,
		paddingRight: 16,
		marginTop: 8,
	},
	staffCommentBody: {
		flex: 1,
		flexDirection: 'row',
	},
	staffTimestampContainer: {
		marginTop: 8,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	likeCountRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	actionButtonsContainer: {
		position: 'absolute',
		right: 0,
		top: 0,
	},
	actionButtons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: '#ffffff',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 2,
	},
	actionCountText: {
		fontFamily: 'Pretendard',
		fontSize: 13,
		fontWeight: '300' as any,
		color: '#676767',
	},
	actionDivider: {
		width: 1,
		height: 9,
		backgroundColor: '#d9d9d9',
	},
	commentText: {
		fontSize: 13,
		lineHeight: 20.8,
		color: '#646464',
		flex: 1,
		flexWrap: 'wrap',
		flexShrink: 1,
	},
});
