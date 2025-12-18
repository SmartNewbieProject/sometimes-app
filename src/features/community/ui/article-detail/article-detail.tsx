import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        <View style={detailStyles.separator} />

        <UserProfile
          author={article.author}
          universityName={
            article.author.universityDetails.name as UniversityName
          }
          isOwner={isOwner}
        />

        <View style={detailStyles.titleRow}>
          <Text size="md" weight="medium" textColor="black">
            {article.title}
          </Text>
        </View>
        <LinkifiedText
          style={detailStyles.contentText}
          textColor="black"
        >
          {article.content}
        </LinkifiedText>

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
              <Text
                style={{
                  color: semanticColors.text.muted,
                  fontFamily: "Pretendard",
                  fontSize: 13,
                  fontStyle: "normal",
                  fontWeight: "300" as any,
                  lineHeight: 14.4,
                  fontFeatureSettings: "'liga' off, 'clig' off",
                }}
              >
                {dayUtils.formatRelativeTime(article.createdAt)}
              </Text>
              <Text
                style={{
                  color: semanticColors.text.muted,
                  fontFamily: "Pretendard",
                  fontSize: 13,
                  fontStyle: "normal",
                  fontWeight: "300" as any,
                  lineHeight: 14.4,
                  fontFeatureSettings: "'liga' off, 'clig' off",
                  marginLeft: 8,
                }}
              >
                {`·  조회 ${article.readCount}`}
              </Text>
            </View>

            <View style={detailStyles.metaRight}>
              <Interaction.Like
                count={likeCount}
                isLiked={isLiked}
                iconSize={18}
                onPress={() => like(article)}
              />
              <View style={detailStyles.interactionSpacer} />
              <Interaction.Comment count={totalCommentCount} iconSize={18} />
            </View>
          </View>
        </View>
        <View style={detailStyles.divider} />
        <View style={detailStyles.flex1}>
          <Loading.Lottie
            title={t("features.community.ui.article_detail.loading_comments")}
            loading={isCommentLoading}
          >
            <View style={detailStyles.commentsContainer}>
              {renderComments(comments, editingCommentId)}
            </View>
          </Loading.Lottie>
        </View>
      </ScrollView>
      <View
        style={[
          detailStyles.inputFormContainer,
          { paddingBottom: insets.bottom },
        ]}
      >
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

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: semanticColors.surface.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 20,
  },
  separator: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
    marginBottom: 15,
  },
  titleRow: {
    marginVertical: 12,
    marginBottom: 24,
    marginHorizontal: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentText: {
    marginBottom: 16,
    fontSize: 14,
    marginHorizontal: 8,
    lineHeight: 20,
  },
  imagesContainer: {
    marginHorizontal: 8,
    marginBottom: 16,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 8,
  },
  articleImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
  },
  metaContainer: {
    width: "100%",
    marginTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginHorizontal: 8,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  interactionSpacer: {
    width: 12,
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
  },
  flex1: {
    flex: 1,
  },
  commentsContainer: {
    display: "flex",
    flexDirection: "column",
    paddingBottom: 16,
  },
  inputFormContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: semanticColors.surface.background,
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.default,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
});
