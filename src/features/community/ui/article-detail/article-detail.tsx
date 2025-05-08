import { TouchableOpacity, View, Image, Button, ScrollView } from "react-native"   
import { Text } from "@/src/shared/ui"
import { Article } from "@/src/features/community/types"
import { IconWrapper } from "@/src/shared/ui/icons"
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { Show } from "@/src/shared/ui/show";
import { ArticleDetailComment } from "./article-detail-comment";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import React from "react";
import { getUnivLogo, tryCatch, UniversityName } from "@/src/shared/libs";
import { Comment } from "@/src/features/community/types";
import apis from "@/src/features/community/apis";
import Interaction from "@/src/features/community/ui/article/interaction-nav";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useLocalSearchParams } from "expo-router";
import { Check } from "@/src/shared/ui";
import SendIcon from '@/assets/icons/send.svg';
import { Form } from "@/src/widgets/form";


export const ArticleDetail = ({article, }: {article: Article}) => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [checked, setChecked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const form = useForm({
        defaultValues: {
            content: '',
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
            .map((comment: Comment) => {
                return (
                    <React.Fragment key={comment.id}>
                        <ArticleDetailComment comment={comment} onDelete={handleDelete} onUpdate={handleUpdate} />
                    </React.Fragment>
                );
            });
    };
    return (
        <View className="flex-1 px-[16px] relative">
            <View className="h-[1px] bg-[#F3F0FF] mb-[15px]"/>
            <View className="flex-row items-center mb-[12px]">
                <Image 
                    source={{ uri: getUnivLogo(article.author.universityDetails.name as UniversityName) }}
                    style={{ width: 36, height: 36 }}
                    className="rounded-full mr-2"
                />
                <View>
                    <View className="flex-row items-center">
                        <Text size="sm" weight="medium" textColor="black">{article.author.name}</Text>
                        <Show when={isOwner}>
                        <Text className="ml-1 text-[10px]" textColor="pale-purple">(나)</Text>
                        </Show>
                    </View>
                    <View className="flex-row items-center" style={{ alignItems: 'center'}}>
                        <Text className="text-[10px] h-[12px] text-[#7A4AE2] opacity-70" style={{ }}>
                            {article.author.age}세 
                            <Text className="text-[10px] h-[12px] opacity-70"> · </Text>
                            {article.author.universityDetails.name}
                        </Text>
                        <IconWrapper size={11}>
                            <ShieldNotSecuredIcon/>
                        </IconWrapper>
                    </View>
                </View>
            </View>
            <View>
                <Text size="md" weight="medium" className="text-[12px] mb-[5px]" textColor="black">{article.title}</Text>
                <Text size="sm" className="h-[full] mb-[9px] leading-5" textColor="black">
                    {article.content}
                </Text>
            </View>
                <View className="w-[300px] px-[31px] justify-between">
                    <View className="flex-row items-center justify-between gap-4 pb-[10px]">
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
            <View className="flex-row flex-x h-[50px] items-center gap-[5px] ml-[16px] mb-[32px] rounded-[16px] bg-[#F8F4FF]">
                <View className="flex-row items-center gap-[5px]">    
                    {editingCommentId && (
                        <TouchableOpacity className="pl-[12px]  pb-[1px]" onPress={handleCancelEdit}>
                            <Text>취소</Text>
                        </TouchableOpacity>
                    )}
                    <Check.Box className="pl-[12px] h-[25px]" checked={checked} size={25} onChange={(checked) => setChecked(checked)} />
                    <Text className="mr-1 text-black text-[15px] h-[25px] flex items-center">익명</Text>
                </View>
                <Form.LabelInput
                    name="content"
                    control={form.control}
                    className="w-full  ml-[10px] mr-[20px] border-b-0 text-xs text-[#A892D7] mt-[-4px]"
                    placeholder={editingCommentId ? editingContent : "댓글을 입력하세요"}
                    label=""
                    onChange={(e) => setEditingContent(e.target.value)}
                />
                <TouchableOpacity onPress={editingCommentId ? handleSubmitUpdate : form.handleSubmit(handleSubmit)} disabled={!editingContent}>
                    <IconWrapper size={18} className="">
                        <SendIcon />
                    </IconWrapper>
                </TouchableOpacity>
            </View>
        </View>
    )
}