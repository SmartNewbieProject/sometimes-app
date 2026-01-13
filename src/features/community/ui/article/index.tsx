import { useAuth } from '@/src/features/auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useBoolean } from '@/src/shared/hooks/use-boolean';
import { ImageResources, type UniversityName, dayUtils } from '@/src/shared/libs';
import {
	Divider,
	Dropdown,
	type DropdownItem,
	ImageResource,
	LinkifiedText,
	Show,
	Text,
} from '@/src/shared/ui';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useModal } from '@/src/shared/hooks/use-modal';
import { useTranslation } from 'react-i18next';
import { useBlockUser } from '../../hooks/use-block-user';
import type { Article as ArticleType } from '../../types';
import { Comment } from '../comment';
import { UserProfile } from '../user-profile';
import Interaction from './interaction-nav';
export interface ArticleItemProps {
	data: ArticleType;
	onPress: () => void;
	onLike: () => void;
	refresh: () => void | Promise<void>;
	onDelete: (id: string) => void;
	isPreviewOpen?: boolean;
	onTogglePreview?: () => void;
}

export function Article({
	data,
	onPress,
	onLike,
	onDelete,
	isPreviewOpen = false,
	onTogglePreview = () => {},
}: ArticleItemProps) {
	const { my } = useAuth();
	const { t } = useTranslation();
	const author = data?.author;
	const comments = data.comments;
	const university = author?.universityDetails;
	const universityName = university?.name as UniversityName;
	//   const {
	//     value: showComment,
	//     toggle: toggleShowComment,
	//     setFalse,
	//   } = useBoolean();
	const { value: isDropdownOpen, setValue: setDropdownOpen } = useBoolean();
	const { mutate: blockUser } = useBlockUser();
	const { showModal } = useModal();

	const isOwner = (() => {
		if (!my) return false;
		return my.id === author.id;
	})();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleLike = useCallback(
		(e: { stopPropagation: () => void }) => {
			e.stopPropagation();
			onLike();
		},
		[onLike],
	);

	const handleBlockUser = () => {
		showModal({
			title: t('features.community.ui.block.modal_title'),
			children: (
				<View>
					<Text size="sm" textColor="black">
						{t('features.community.ui.block.modal_message', { name: author.name })}
					</Text>
				</View>
			),
			primaryButton: {
				text: t('features.community.ui.block.confirm_button'),
				onClick: () => {
					blockUser(author.id);
					setDropdownOpen(false);
				},
			},
			secondaryButton: {
				text: t('features.community.ui.block.cancel_button'),
				onClick: () => {
					setDropdownOpen(false);
				},
			},
		});
	};

	const dropdownMenus: DropdownItem[] = (() => {
		const menus: DropdownItem[] = [];
		if (isOwner) {
			const ownerMenus: DropdownItem[] = [
				{
					key: 'update',
					content: t('features.community.ui.article.edit_button'),
					onPress: () => {
						router.push(`/community/update/${data.id}`);
					},
				},
				{
					key: 'delete',
					content: t('features.community.ui.article.delete_button'),
					onPress: () => {
						onDelete(data.id);
						setDropdownOpen(false);
					},
				},
			];
			menus.push(...ownerMenus);
		}

		if (!isOwner) {
			menus.push({
				key: 'report',
				content: t('features.community.ui.article.report_button'),
				onPress: () => {
					router.push(`/community/report/${data.id}`);
				},
			});
			menus.push({
				key: 'block',
				content: t('features.community.ui.block.menu_item'),
				onPress: handleBlockUser,
			});
		}

		return menus;
	})();

	const handleArticlePress = () => {
		if (!isDropdownOpen) {
			onPress();
		}
	};

	const redirectDetails = () => router.push(`/community/${data.id}`);

	useEffect(() => {
		setDropdownOpen(false);
	}, [setDropdownOpen]);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				testID={`article-item-${data.id}`}
				onPress={handleArticlePress}
				style={styles.touchable}
				activeOpacity={0.7}
			>
				<UserProfile author={author} universityName={universityName} isOwner={isOwner} />

				<View
					style={[
						styles.contentRow,
						{
							position: 'relative',
							minHeight: data.images && data.images.length > 0 ? 87 : undefined,
						},
					]}
				>
					<View
						style={[
							styles.textContent,
							data.images && data.images.length > 0 && { maxWidth: '65%' },
						]}
					>
						<Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
							{data.title}
						</Text>

						<LinkifiedText
							size="sm"
							style={styles.contentText}
							numberOfLines={2}
							ellipsizeMode="tail"
						>
							{data.content}
						</LinkifiedText>
					</View>

					{data.images && data.images.length > 0 && (
						<TouchableOpacity
							onPress={redirectDetails}
							activeOpacity={0.85}
							style={styles.imageContainer}
						>
							<View style={styles.imageWrapper}>
								<Image
									source={{
										uri: data.images.sort((a, b) => a.displayOrder - b.displayOrder)[0].imageUrl,
									}}
									style={styles.articleImage}
									resizeMode="cover"
								/>
								{data.images.length > 1 && (
									<View style={styles.imageCountBadge}>
										<Text size="12" textColor="white" weight="medium">
											+{data.images.length - 1}
										</Text>
									</View>
								)}
							</View>
						</TouchableOpacity>
					)}
				</View>

				<View style={styles.metaRow}>
					<View style={styles.metaLeft}>
						<Text style={styles.metaText}>
							{dayUtils.formatRelativeTime(data.createdAt)}・
							{t('features.community.ui.common.views')} {data.readCount}
						</Text>
					</View>

					<View style={styles.metaRight}>
						<Interaction.Like
							count={data.likeCount}
							isLiked={data.isLiked}
							iconSize={18}
							onPress={handleLike}
						/>
						<View style={styles.interactionSpacer} />
						<Interaction.Comment
							count={data.commentCount}
							iconSize={18}
							onPress={onTogglePreview}
						/>
					</View>
				</View>

				<Show when={isPreviewOpen}>
					<View style={styles.commentsContainer}>
						{comments.map((comment) => (
							<View style={styles.commentItem} key={comment.id}>
								<Comment data={comment} style={styles.commentSpacing} />
								<Divider.Horizontal />
							</View>
						))}
						{data.commentCount > 3 && (
							<View style={styles.viewMoreContainer}>
								<TouchableOpacity style={styles.viewMoreButton} onPress={redirectDetails}>
									<Text size="sm">{t('features.community.ui.article.view_more_replies')}</Text>
									<ImageResource
										resource={ImageResources.PURPLE_ARROW_RIGHT}
										width={16}
										height={16}
									/>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</Show>
			</TouchableOpacity>

			<View
				style={styles.dropdownContainer}
				onTouchEnd={(e) => {
					e.stopPropagation();
				}}
			>
				<Dropdown open={isDropdownOpen} items={dropdownMenus} onOpenChange={setDropdownOpen} />
			</View>

			{!isPreviewOpen && <View style={styles.separator} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		position: 'relative',
		paddingHorizontal: 16,
		paddingVertical: 5,
	},
	touchable: {
		padding: 14,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#e6dbff',
		borderRadius: 15,
	},
	contentRow: {
		marginTop: 10,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	textContent: {
		flex: 1,
		flexShrink: 1,
		minWidth: 0,
		overflow: 'hidden',
		paddingRight: 12,
	},
	titleText: {
		fontFamily: 'Pretendard',
		fontSize: 16,
		fontWeight: '600' as any,
		lineHeight: 19.2,
		color: '#000000',
	},
	contentText: {
		marginTop: 3,
		lineHeight: 18.2,
		color: '#646464',
		fontSize: 13,
	},
	imageContainer: {
		width: 87,
		height: 87,
		flexShrink: 0,
		position: 'absolute',
		right: 0,
		top: 0,
	},
	imageWrapper: {
		position: 'relative',
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: '#f3f4f6',
		width: 87,
		height: 87,
	},
	articleImage: {
		width: '100%',
		height: '100%',
	},
	imageCountBadge: {
		position: 'absolute',
		right: 4,
		bottom: 4,
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 2,
		backgroundColor: 'rgba(0,0,0,0.6)',
	},
	metaRow: {
		marginTop: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	metaLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	metaText: {
		color: '#676767',
		fontFamily: 'Pretendard',
		fontSize: 13,
		fontStyle: 'normal',
		fontWeight: '300' as any,
		lineHeight: 15.6,
	},
	metaTextWithMargin: {
		marginLeft: 0,
	},
	metaRight: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	interactionSpacer: {
		width: 10,
	},
	commentsContainer: {
		width: '100%',
		flexDirection: 'column',
		gap: 6,
		marginTop: 24,
		paddingHorizontal: 18,
	},
	commentItem: {
		width: '100%',
		flexDirection: 'column',
	},
	commentSpacing: {
		marginBottom: 6,
	},
	viewMoreContainer: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginVertical: 4,
	},
	viewMoreButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	dropdownContainer: {
		position: 'absolute',
		right: 24,
		top: 17,
	},
	separator: {
		height: 0,
	},
});
