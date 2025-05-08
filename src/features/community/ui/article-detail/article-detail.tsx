import { View, ScrollView } from "react-native"   
import { Text } from "@/src/shared/ui"
import { ArticleDetailComment } from "./article-detail-comment";
import { useForm } from "react-hook-form";
import { useState } from "react";
import React from "react";
import { tryCatch } from "@shared/libs";
import type { UniversityName } from '@shared/libs';
import apis from "@/src/features/community/apis";
import Interaction from "@/src/features/community/ui/article/interaction-nav";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useLocalSearchParams } from "expo-router";
import { UserProfile } from "../user-profile";
import type { Article, Comment, CommentForm } from "../../types";
import { InputForm } from '../comment/input-form';
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation
} from '@/src/features/community/queries/comments';
import Loading from "@/src/features/loading";

export const ArticleDetail = ({ article }: { article: Article }) => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [checked, setChecked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const form = useForm<CommentForm>({
        defaultValues: {
            content: '',
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
    const { data: comments = [], isLoading: isCommentLoading } = useCommentsQuery(articleId);
    const createCommentMutation = useCreateCommentMutation(articleId);
    const updateCommentMutation = useUpdateCommentMutation(articleId);
    const deleteCommentMutation = useDeleteCommentMutation(articleId);

    const handleSubmit = async (data: { content: string }) => {
        createCommentMutation.mutate({
            content: data.content,
            anonymous: checked,
        }, {
            onSuccess: () => {
                form.reset();
                setEditingContent('');
            },
        });
    };

    const handleUpdate = (id: string, content: string) => {
        setEditingCommentId(id);
        setEditingContent(content);
        setIsEditing(true);
    };

    const handleSubmitUpdate = async () => {
        if (editingCommentId) {
            updateCommentMutation.mutate({
                commentId: editingCommentId,
                content: editingContent,
            }, {
                onSuccess: () => {
                    setEditingCommentId(null);
                    setEditingContent('');
                    setIsEditing(false);
                    form.reset();
                },
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const like = (item: Article) => {
      tryCatch(async () => {
        await apis.articles.doLike(item);
        setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
        setIsLiked(!isLiked);
      }, (error) => {
        console.error('좋아요 업데이트 실패:', error);
      });
    };
    
    const handleDelete = async (commentId: string) => {
			deleteCommentMutation.mutate(commentId);
    };

    const renderComments = (comments: Comment[]) => {
			return comments
				.map((comment: Comment) => (
					<ArticleDetailComment
						key={comment.id}
						comment={comment}
						onDelete={handleDelete} 
						onUpdate={handleUpdate}
					/>
				));
    };

    return (
			<View className="flex-1 px-[16px] relative">
					<View className="h-[1px] bg-[#F3F0FF] mb-[15px]"/>
					<UserProfile 
						author={article.author}
						universityName={article.author.universityDetails.name as UniversityName}
						isOwner={isOwner}
					/>
					<View>
						<Text weight="medium" className="text-md md:text-[18px] mb-[5px]" textColor="black">{article.title}</Text>
						<Text className="text-sm md:text-md h-[full] mb-[9px] leading-5" textColor="black">
							{article.content}
						</Text>
					</View>
						<View className="w-full mt-[10px]">
							<View className="flex-row items-center justify-around gap-4 pb-[10px]">
							<Interaction.Like count={likeCount} isLiked={isLiked} onPress={() => like(article)} />
							<Interaction.Comment count={article.comments.length} />
							<Interaction.View count={article.readCount} />
						</View>
					</View>
					<View className="h-[1px] bg-[#F3F0FF] mb-[20px]"/>
					<ScrollView>
						<Loading.Lottie title="댓글을 불러오고 있어요" loading={isCommentLoading}>
							<View className="flex flex-col gap-y-[8px] mt-2">
							{renderComments(comments)}
							</View>
						</Loading.Lottie>
					</ScrollView>
					<View className="h-[1px] bg-[#FFFFFF]"/>

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
    );
}