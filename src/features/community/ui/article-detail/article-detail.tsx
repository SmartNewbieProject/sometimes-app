import { View, ScrollView } from "react-native"   
import { Text } from "@/src/shared/ui"
import { ArticleDetailComment } from "./article-detail-comment";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
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

export const ArticleDetail = ({article, }: {article: Article}) => {
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
    const [comments, setComments] = useState<Comment[]>([]);
    const [likeCount, setLikeCount] = useState(article.likeCount);
    const [isLiked, setIsLiked] = useState(article.isLiked);
    const { my } = useAuth();
    const isOwner = (() => {
        if (!my) return false;
        return my.id === article.author.id;
    })();

    useEffect(() => {
        fetchComments();
    }, []);


    const fetchComments = async () => {
        const data = await apis.comments.getComments({articleId: article.id});
        setComments(data);
    };

    const handleSubmit = async (data: { content: string }) => {
        try {
            await apis.comments.postComments(id, {
                content: data.content,
                anonymous: checked,
            });
            console.log('댓글 작성 성공');
            form.reset();
            if (article) {
                article.commentCount += 1;
            }
            await fetchComments();
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    }

    const handleUpdate = (id: string, content: string) => {
        setEditingCommentId(id);
        setEditingContent(content);
        setIsEditing(true);
    }

    const handleSubmitUpdate = async () => {
			if (editingCommentId) {
				try {
					await apis.comments.patchComments(id, editingCommentId, { content: editingContent });
					setEditingCommentId(null);
					setEditingContent('');
				} catch (error) {
						console.error('댓글 수정 실패:', error);
				} finally {
					form.reset();
					setIsEditing(false);
					await fetchComments();
				}
			}
    }

    const handleCancelEdit = () => {
			setEditingCommentId(null);
			setEditingContent('');
    }

    const like = (item: Article) => {
      tryCatch(async () => {
        await apis.articles.doLike(item);
        setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
        setIsLiked(!isLiked);
      }, (error) => {
        console.error('좋아요 업데이트 실패:', error);
      });
    };
    
    const handleDelete = async (id: string) => {
        tryCatch(async () => {
					await apis.comments.deleteComments(article.id, id);
					fetchComments();
        }, (error) => {
					console.error('댓글 삭제 실패:', error);
        });
    };

    const renderComments = (comments: Comment[]) => {
			return comments
				.map((comment: Comment) => (
						<React.Fragment key={comment.id}>
							<ArticleDetailComment comment={comment} onDelete={handleDelete} onUpdate={handleUpdate} />
						</React.Fragment>
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
						<View className="w-full mt-[10px">
							<View className="flex-row items-center justify-around gap-4 pb-[10px]">
							<Interaction.Like count={likeCount} isLiked={isLiked} onPress={() => like(article)} />
							<Interaction.Comment count={article.comments.length} />
							<Interaction.View count={article.readCount} />
						</View>
					</View>
					<View className="h-[1px] bg-[#F3F0FF] mb-[20px]"/>
					<ScrollView>
						<View>
								{renderComments(comments)}
						</View>
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
    )
}