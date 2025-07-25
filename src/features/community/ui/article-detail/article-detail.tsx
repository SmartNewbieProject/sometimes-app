import { useAuth } from "@/src/features/auth/hooks/use-auth";
import apis from "@/src/features/community/apis";
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "@/src/features/community/queries/comments";
import { QUERY_KEYS } from "@/src/features/community/queries/keys";
import Interaction from "@/src/features/community/ui/article/interaction-nav";
import Loading from "@/src/features/loading";
import { Text } from "@/src/shared/ui";
import { dayUtils, tryCatch } from "@shared/libs";
import type { UniversityName } from "@shared/libs";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { Keyboard, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Article, Comment, CommentForm } from "../../types";
import { InputForm } from "../comment/input-form";
import { UserProfile } from "../user-profile";
import { ArticleDetailComment } from "./article-detail-comment";

export const ArticleDetail = ({ article }: { article: Article }) => {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [checked, setChecked] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const form = useForm<CommentForm>({
    defaultValues: {
      content: editingCommentId ? editingContent : "",
      anonymous: true,
    },
  });
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const [isLiked, setIsLiked] = useState(article.isLiked);
  const { my } = useAuth();
  const isOwner = (() => {
    if (!my) return false;
    return my.id === article.author.id;
  })();

  const articleId = id as string;
  const { data: comments = [], isLoading: isCommentLoading } =
    useCommentsQuery(articleId);
  const createCommentMutation = useCreateCommentMutation(articleId);
  const updateCommentMutation = useUpdateCommentMutation(articleId);
  const deleteCommentMutation = useDeleteCommentMutation(articleId);
  const queryClient = useQueryClient();
  const handleSubmit = async (data: { content: string }) => {
    createCommentMutation.mutate(
      {
        content: data.content,
        anonymous: checked,
      },
      {
        onSuccess: () => {
          form.reset();
          setEditingContent("");
          article.comments.length += 1;
          Keyboard.dismiss();
        },
      }
    );
  };

  const handleUpdate = (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (comment) {
      setEditingCommentId(id);
      setEditingContent(comment.content);
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
    article.comments.length -= 1;
  };

  const renderComments = (
    comments: Comment[],
    editingCommentId: null | string
  ) => {
    return comments.map((comment: Comment) => (
      <ArticleDetailComment
        key={comment.id}
        isEditing={comment.id === editingCommentId}
        comment={comment}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    ));
  };

  return (
    <View className="flex-1 relative bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1 relative  px-5"
      >
        <View className="h-[1px] bg-[#F3F0FF] mb-[15px]" />

        <UserProfile
          author={article.author}
          universityName={
            article.author.universityDetails.name as UniversityName
          }
          isOwner={isOwner}
        />

        <View className="my-3 mb-6 mx-[8px]  flex flex-row  items-center justify-between">
          <Text numberofLine={1} size="md" weight="medium" textColor="black">
            {article.title}
          </Text>
          <Text size="12" textColor="pale-purple">
            {dayUtils.formatRelativeTime(article.createdAt)}
          </Text>
        </View>
        <Text className="mb-4 text-[14px] mx-[8px] leading-5" textColor="black">
          {article.content}
        </Text>
        <View className="w-full mt-[10px]">
          <View className="flex-row items-center justify-around gap-4 pb-[10px]">
            <Interaction.Like
              count={likeCount}
              isLiked={isLiked}
              onPress={() => like(article)}
            />
            <Interaction.Comment count={article.comments.length} />
            <Interaction.View count={article.readCount} />
          </View>
        </View>
        <View className="h-[1px] bg-[#F3F0FF] " />
        <View className="flex-1">
          <Loading.Lottie
            title="댓글을 불러오고 있어요"
            loading={isCommentLoading}
          >
            <View className="flex flex-col  pb-4 ">
              {renderComments(comments, editingCommentId)}
            </View>
          </Loading.Lottie>
        </View>
      </ScrollView>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "white",
          paddingBottom: insets.bottom,
          // 기존 mb-8 대신 insets.bottom(홈 인디케이터 높이) 사용
        }}
        className="border-t border-[#F3F0FF] pt-3  px-4"
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
        />
      </View>
    </View>
  );
};
