import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { semanticColors } from '@/src/shared/constants/colors';
import { useKpiAnalytics } from "@/src/shared/hooks";
import apis from "@/src/features/community/apis";
import apis_comments from "@/src/features/community/apis/comments";
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "@/src/features/community/queries/comments";
import { QUERY_KEYS } from "@/src/features/community/queries/keys";
import Interaction from "@/src/features/community/ui/article/interaction-nav";
import Loading from "@/src/features/loading";
import { LinkifiedText, Text } from "@/src/shared/ui";
import { dayUtils, tryCatch } from "@shared/libs";
import type { UniversityName } from "@shared/libs";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Article, Comment, CommentForm } from "../../types";
import { InputForm } from "../comment/input-form";
import { UserProfile } from "../user-profile";
import { ArticleDetailComment } from "./article-detail-comment";

import PhotoSlider from "@/src/widgets/slide/photo-slider";
import { useForm } from "react-hook-form";

export const ArticleDetail = ({ article }: { article: Article }) => {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [checked, setChecked] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const form = useForm<CommentForm>({
    defaultValues: {
      content: editingCommentId ? editingContent : "",
      anonymous: true,
    },
  });
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const { communityEvents } = useKpiAnalytics();
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
  const { data: comments = [], isLoading: isCommentLoading } =
    useCommentsQuery(articleId);
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
            content: "",
            anonymous: true,
          });
          setEditingContent("");
          setReplyingToCommentId(null);
          Keyboard.dismiss();
        },
      }
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

      form.setFocus("content");
    }
  };

  const handleSubmitUpdate = async () => {
    if (editingCommentId) {
      updateCommentMutation.mutate(
        {
          commentId: editingCommentId,
          content: editingContent,
        },
        {
          onSuccess: () => {
            setEditingCommentId(null);
            setEditingContent("");
            form.reset({
              content: "",
              anonymous: true,
            });
            Keyboard.dismiss();
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
    setReplyingToCommentId(null);
    form.reset({
      content: "",
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
          }
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
          }
        );

        await apis.articles.doLike(item);
      },
      (error) => {
        console.error("좋아요 업데이트 실패:", error);
      }
    );
  };

  const handleDelete = async (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleReply = (parentId: string) => {
    setReplyingToCommentId(parentId);
    setEditingCommentId(null);
    setEditingContent("");
    form.reset({ content: "", anonymous: true });
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    form.reset({ content: "", anonymous: true });
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

        console.log("댓글 좋아요 클릭:", {
          commentId,
          currentIsLiked: currentComment.isLiked,
          currentLikeCount: currentComment.likeCount,
        });

        const newIsLiked = !currentComment.isLiked;
        const currentLikeCount = Number(currentComment.likeCount) || 0;
        const newLikeCount = currentComment.isLiked
          ? currentLikeCount - 1
          : currentLikeCount + 1;

        console.log("새로운 상태:", {
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
          }
        );

        const serverResponse = await apis_comments.patchCommentLike(
          articleId,
          commentId
        );
        console.log("서버 응답:", serverResponse);
      },
      (error) => {
        console.error("댓글 좋아요 업데이트 실패:", error);
      }
    );
  };

  const renderComments = (
    comments: Comment[],
    editingCommentId: null | string
  ) => {
    const result: React.ReactElement[] = [];

    comments.forEach((comment: Comment) => {
      result.push(
        <ArticleDetailComment
          key={comment.id}
          isEditing={comment.id === editingCommentId}
          comment={comment}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onReply={handleReply}
          onLike={handleCommentLike}
          isReply={false}
        />
      );

      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply: Comment) => {
          result.push(
            <ArticleDetailComment
              key={reply.id}
              isEditing={reply.id === editingCommentId}
              comment={reply}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onReply={handleReply}
              onLike={handleCommentLike}
              isReply={true}
              rootParentId={comment.id}
            />
          );
        });
      }
    });

    return result;
  };

  const imageUrls = article.images?.map((img) => img.imageUrl) || [];

  return (
    <View style={styles.container}>
      <PhotoSlider
        images={imageUrls}
        onClose={onZoomClose}
        initialIndex={selectedIndex}
        visible={isZoomVisible}
      />

      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
      >
        <View style={styles.divider} />

        <UserProfile
          author={article.author}
          universityName={
            article.author.universityDetails.name as UniversityName
          }
          isOwner={isOwner}
        />

        <View style={styles.titleContainer}>
          <Text size="md" weight="medium" textColor="black">
            {article.title}
          </Text>
        </View>
        <LinkifiedText
          style={styles.content}
          textColor="black"
        >
          {article.content}
        </LinkifiedText>

        {article.images && article.images.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageRow}>
                {article.images
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((image, index) => (
                    <Pressable
                      key={`article-image-${image.id}`}
                      onPress={() => {
                        setSelectedIndex(index);
                        setZoomVisible(true);
                      }}
                      style={styles.imagePressable}
                    >
                      <Image
                        source={{ uri: image.imageUrl }}
                        style={styles.articleImage}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {dayUtils.formatRelativeTime(article.createdAt)}
            </Text>
            <Text style={styles.viewCountText}>
              {`·  조회 ${article.readCount}`}
            </Text>
          </View>

          <View style={styles.interactionContainer}>
            <Interaction.Like
              count={likeCount}
              isLiked={isLiked}
              iconSize={18}
              onPress={() => like(article)}
            />
            <View style={styles.interactionSpacer} />
            <Interaction.Comment count={totalCommentCount} iconSize={18} />
          </View>
        </View>
        <View style={styles.bottomDivider} />
        <View style={styles.commentsContainer}>
          <Loading.Lottie
            title="댓글을 불러오고 있어요"
            loading={isCommentLoading}
          >
            <View style={styles.commentsWrapper}>
              {renderComments(comments, editingCommentId)}
            </View>
          </Loading.Lottie>
        </View>
      </ScrollView>
      <View style={styles.bottomInputContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContainer: {
    paddingVertical: 16,
    alignItems: 'stretch',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.border.primary,
    marginVertical: 16,
  },
  titleContainer: {
    marginVertical: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 12,
    alignSelf: 'stretch',
  },
  imageContainer: {
    marginVertical: 16,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  imagePressable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  articleImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.primary,
    marginTop: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: semanticColors.text.secondary,
  },
  viewCountText: {
    fontSize: 12,
    color: semanticColors.text.secondary,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionSpacer: {
    width: 16,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: semanticColors.border.primary,
    marginVertical: 16,
  },
  commentsContainer: {
    flex: 1,
  },
  commentsWrapper: {
    paddingBottom: 16,
  },
  bottomInputContainer: {
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.primary,
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
