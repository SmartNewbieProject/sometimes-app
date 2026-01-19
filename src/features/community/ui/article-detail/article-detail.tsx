import { useAuth } from '@/src/features/auth/hooks/use-auth';
import apis from '@/src/features/community/apis';
import apis_comments from '@/src/features/community/apis/comments';
import {
	useCommentsQuery,
	useCreateCommentMutation,
	useDeleteCommentMutation,
	useUpdateCommentMutation,
} from '@/src/features/community/queries/comments';
import { QUERY_KEYS } from '@/src/features/community/queries/keys';
import Interaction from '@/src/features/community/ui/article/interaction-nav';
import Loading from '@/src/features/loading';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useMixpanel } from '@/src/shared/hooks';
import { LinkifiedText, Text } from '@/src/shared/ui';
import { dayUtils, tryCatch } from '@shared/libs';
import type { UniversityName } from '@shared/libs';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Article, Comment, CommentForm } from '../../types';
import { InputForm } from '../comment/input-form';
import { UserProfile } from '../user-profile';
import { ArticleDetailComment } from './article-detail-comment';

import { devLogWithTag } from '@/src/shared/utils';
import PhotoSlider from '@/src/widgets/slide/photo-slider';
import { useForm } from 'react-hook-form';

export const ArticleDetail = ({ article }: { article: Article }) => {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { t } = useTranslation();
	const [checked, setChecked] = useState(true);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState<string>('');
	const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
	const form = useForm<CommentForm>({
		defaultValues: {
			content: editingCommentId ? editingContent : '',
			anonymous: true,
		},
	});
	const [likeCount, setLikeCount] = useState(article.likeCount);
	const { communityEvents } = useMixpanel();
	const [isLiked, setIsLiked] = useState(article.isLiked);
	const { my } = useAuth();
	const isOwner = (() => {
		if (!my) return false;
		return my.id === article.author.id;
	})();

	const [isZoomVisible, setZoomVisible] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const onZoomClose = () => {
		setZoomVisible(false);
	};

	const articleId = id as string;
	const { data: comments = [], isLoading: isCommentLoading } = useCommentsQuery(articleId);
	const createCommentMutation = useCreateCommentMutation(articleId);
	const updateCommentMutation = useUpdateCommentMutation(articleId);
	const deleteCommentMutation = useDeleteCommentMutation(articleId);
	const queryClient = useQueryClient();

	const totalCommentCount = comments.reduce((total, comment) => {
		return total + 1 + (comment.replies ? comment.replies.length : 0);
	}, 0);
	const handleSubmit = async (data: { content: string }) => {
		// KPI 이벤트: 댓글 추가
		communityEvents.trackCommentAdded(article.id, data.content.length);

		createCommentMutation.mutate(
			{
				content: data.content,
				anonymous: checked,
				parentId: replyingToCommentId || undefined,
			},
			{
				onSuccess: () => {
					form.reset({
						content: '',
						anonymous: true,
					});
					setEditingContent('');
					setReplyingToCommentId(null);
					Keyboard.dismiss();
				},
			},
		);
	};

	const handleUpdate = (id: string) => {
		let comment = comments.find((c) => c.id === id);

		if (!comment) {
			for (const parentComment of comments) {
				if (parentComment.replies) {
					comment = parentComment.replies.find((reply) => reply.id === id);
					if (comment) break;
				}
			}
		}

		if (comment) {
			setEditingCommentId(id);
			setEditingContent(comment.content);
			setReplyingToCommentId(null);
			form.reset({
				content: comment.content,
				anonymous: true,
			});

			form.setFocus('content');
		}
	};

	const handleSubmitUpdate = async () => {
		if (editingCommentId) {
			const content = form.getValues('content');
			updateCommentMutation.mutate(
				{
					commentId: editingCommentId,
					content,
				},
				{
					onSuccess: () => {
						setEditingCommentId(null);
						setEditingContent('');
						form.reset({
							content: '',
							anonymous: true,
						});
						Keyboard.dismiss();
					},
				},
			);
		}
	};

	const handleCancelEdit = () => {
		setEditingCommentId(null);
		setEditingContent('');
		setReplyingToCommentId(null);
		form.reset({
			content: '',
			anonymous: true,
		});
		Keyboard.dismiss();
	};

	useEffect(() => {
		if (article) {
			setLikeCount(article.likeCount);
			setIsLiked(article.isLiked);
		}
	}, [article]);

	const like = (item: Article) => {
		tryCatch(
			async () => {
				const newIsLiked = !isLiked;
				const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;

				// KPI 이벤트: 게시글 좋아요
				if (newIsLiked) {
					communityEvents.trackPostLiked(article.id);
				}

				setLikeCount(newLikeCount);
				setIsLiked(newIsLiked);

				queryClient.setQueryData(
					QUERY_KEYS.articles.detail(articleId),
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(oldData: any) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							likeCount: newLikeCount,
							isLiked: newIsLiked,
						};
					},
				);

				queryClient.setQueriesData(
					{ queryKey: QUERY_KEYS.articles.lists() },
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(oldData: any) => {
						if (!oldData) return oldData;

						return {
							...oldData,
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							pages: oldData.pages.map((page: any) => ({
								...page,
								items: page.items.map((article: Article) => {
									if (article.id === articleId) {
										return {
											...article,
											likeCount: newLikeCount,
											isLiked: newIsLiked,
										};
									}
									return article;
								}),
							})),
						};
					},
				);

				await apis.articles.doLike(item);
			},
			(error) => {
				console.error('Article like update failed:', error);
			},
		);
	};

	const handleDelete = async (commentId: string) => {
		deleteCommentMutation.mutate(commentId);
	};

	const handleReply = (parentId: string) => {
		setReplyingToCommentId(parentId);
		setEditingCommentId(null);
		setEditingContent('');
		form.reset({ content: '', anonymous: true });
	};

	const handleCancelReply = () => {
		setReplyingToCommentId(null);
		form.reset({ content: '', anonymous: true });
	};

	const handleCommentLike = (commentId: string) => {
		tryCatch(
			async () => {
				const findComment = (comments: Comment[]): Comment | null => {
					for (const comment of comments) {
						if (comment.id === commentId) return comment;
						if (comment.replies) {
							const found = findComment(comment.replies);
							if (found) return found;
						}
					}
					return null;
				};

				const currentComment = findComment(comments);
				if (!currentComment) return;

				devLogWithTag('Comment Like', 'Toggling:', {
					commentId,
					currentIsLiked: currentComment.isLiked,
				});

				const newIsLiked = !currentComment.isLiked;
				const currentLikeCount = Number(currentComment.likeCount) || 0;
				const newLikeCount = currentComment.isLiked ? currentLikeCount - 1 : currentLikeCount + 1;

				devLogWithTag('Comment Like', 'New state:', {
					newIsLiked,
					newLikeCount,
				});

				queryClient.setQueryData(
					QUERY_KEYS.comments.lists(articleId),
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(oldData: any) => {
						if (!oldData) return oldData;

						const updateComment = (comments: Comment[]): Comment[] => {
							return comments.map((comment) => {
								if (comment.id === commentId) {
									return {
										...comment,
										isLiked: newIsLiked,
										likeCount: newLikeCount,
									};
								}
								if (comment.replies) {
									return {
										...comment,
										replies: updateComment(comment.replies),
									};
								}
								return comment;
							});
						};

						return updateComment(oldData);
					},
				);

				const serverResponse = await apis_comments.patchCommentLike(articleId, commentId);
				devLogWithTag('Comment Like', 'Server response:', { success: !!serverResponse });
			},
			(error) => {
				console.error('Comment like update failed:', error);
			},
		);
	};

	const renderComments = (comments: Comment[], editingCommentId: null | string) => {
		const result: React.ReactElement[] = [];
		const flatComments: { comment: Comment; isReply: boolean; rootParentId?: string }[] = [];

		comments.forEach((comment: Comment) => {
			flatComments.push({ comment, isReply: false });
			if (comment.replies && comment.replies.length > 0) {
				comment.replies.forEach((reply: Comment) => {
					flatComments.push({ comment: reply, isReply: true, rootParentId: comment.id });
				});
			}
		});

		flatComments.forEach((item, index) => {
			const nextItem = flatComments[index + 1];
			const nextIsStaff = nextItem?.comment.author.isStaff === true;

			result.push(
				<ArticleDetailComment
					key={item.comment.id}
					isEditing={item.comment.id === editingCommentId}
					comment={item.comment}
					onDelete={handleDelete}
					onUpdate={handleUpdate}
					onReply={handleReply}
					onLike={handleCommentLike}
					isReply={item.isReply}
					rootParentId={item.rootParentId}
					hideBottomBorder={nextIsStaff}
					articleAuthorId={article.author.id}
				/>,
			);
		});

		return result;
	};

	const imageUrls = article.images?.map((img) => img.imageUrl) || [];

	return (
		<View style={detailStyles.container}>
			<PhotoSlider
				images={imageUrls}
				onClose={onZoomClose}
				initialIndex={selectedIndex}
				visible={isZoomVisible}
			/>

			<ScrollView
				contentContainerStyle={detailStyles.scrollContent}
				keyboardShouldPersistTaps="handled"
				style={detailStyles.scrollView}
			>
				<View style={detailStyles.articleCard}>
					<UserProfile
						author={article.author}
						universityName={article.author.universityDetails.name as UniversityName}
						isOwner={isOwner}
					/>

					<View style={detailStyles.titleRow}>
						<Text style={detailStyles.titleText}>{article.title}</Text>
					</View>
					<LinkifiedText style={detailStyles.contentText}>{article.content}</LinkifiedText>

					{article.images && article.images.length > 0 && (
						<View style={detailStyles.imagesContainer}>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View style={detailStyles.imagesRow}>
									{article.images
										.sort((a, b) => a.displayOrder - b.displayOrder)
										.map((image, index) => (
											<Pressable
												key={`article-image-${image.id}`}
												onPress={() => {
													setSelectedIndex(index);
													setZoomVisible(true);
												}}
											>
												<Image
													source={{ uri: image.imageUrl }}
													style={detailStyles.articleImage}
													resizeMode="cover"
												/>
											</Pressable>
										))}
								</View>
							</ScrollView>
						</View>
					)}

					<View style={detailStyles.metaContainer}>
						<View style={detailStyles.metaRow}>
							<View style={detailStyles.metaLeft}>
								<Text style={detailStyles.metaText}>
									{dayUtils.formatRelativeTime(article.createdAt)}・
									{t('features.community.ui.common.views')} {article.readCount}
								</Text>
							</View>

							<View style={detailStyles.metaRight}>
								<Interaction.Like
									count={likeCount}
									isLiked={isLiked}
									iconSize={16}
									onPress={() => like(article)}
								/>
								<View style={detailStyles.interactionSpacer} />
								<Interaction.Comment count={totalCommentCount} iconSize={16} />
							</View>
						</View>
					</View>
				</View>

				<View style={detailStyles.divider} />
				<View style={detailStyles.flex1}>
					<Loading.Lottie
						title={t('features.community.ui.article_detail.loading_comments')}
						loading={isCommentLoading}
					>
						<View style={detailStyles.commentsContainer}>
							{renderComments(comments, editingCommentId)}
						</View>
					</Loading.Lottie>
				</View>
			</ScrollView>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
				style={detailStyles.keyboardAvoidingView}
			>
				<View style={[detailStyles.inputFormContainer, { paddingBottom: insets.bottom }]}>
					<InputForm
						checked={checked}
						setChecked={setChecked}
						editingCommentId={editingCommentId}
						handleCancelEdit={handleCancelEdit}
						editingContent={editingContent}
						setEditingContent={setEditingContent}
						form={form}
						handleSubmitUpdate={handleSubmitUpdate}
						handleSubmit={handleSubmit}
						replyingToCommentId={replyingToCommentId}
						handleCancelReply={handleCancelReply}
					/>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
};

const detailStyles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
		backgroundColor: semanticColors.surface.background,
	},
	scrollContent: {
		paddingBottom: 100,
	},
	scrollView: {
		flex: 1,
		position: 'relative',
		paddingHorizontal: 16,
	},
	articleCard: {
		marginTop: 8,
		padding: 14,
		borderWidth: 1,
		borderColor: '#7a4ae2',
		borderRadius: 15,
	},
	titleRow: {
		marginTop: 16,
		marginBottom: 10,
	},
	titleText: {
		fontFamily: 'Pretendard',
		fontSize: 16,
		fontWeight: '600' as any,
		lineHeight: 19.2,
		color: '#000000',
	},
	contentText: {
		marginBottom: 16,
		fontSize: 13,
		lineHeight: 20.8,
		color: '#646464',
	},
	imagesContainer: {
		marginBottom: 16,
	},
	imagesRow: {
		flexDirection: 'row',
		gap: 8,
	},
	articleImage: {
		width: 128,
		height: 128,
		borderRadius: 8,
	},
	metaContainer: {
		width: '100%',
		marginTop: 10,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	metaLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	metaText: {
		fontFamily: 'Pretendard',
		fontSize: 13,
		fontWeight: '300' as any,
		lineHeight: 15.6,
		color: '#676767',
	},
	metaRight: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	interactionSpacer: {
		width: 10,
	},
	divider: {
		height: 1,
		backgroundColor: semanticColors.surface.other,
		marginTop: 16,
	},
	flex1: {
		flex: 1,
	},
	commentsContainer: {
		display: 'flex',
		flexDirection: 'column',
		paddingBottom: 16,
	},
	keyboardAvoidingView: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
	inputFormContainer: {
		backgroundColor: semanticColors.surface.background,
		borderTopWidth: 1,
		borderTopColor: semanticColors.border.default,
		paddingTop: 12,
		paddingHorizontal: 16,
	},
});
