import { router, useLocalSearchParams } from "expo-router";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, ScrollView, Pressable } from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import HamburgerIcon from '@/assets/icons/menu-dots-vertical.svg';
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useArticleComments, useArticleDetail } from "@/src/features/community/hooks/";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Check } from "@/src/shared/ui";
import SendIcon from '@/assets/icons/send.svg';
import { Form } from "@/src/widgets/form";
import apis from '@/src/features/community/apis';

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { article } = useArticleDetail(id);
    const { comments } = useArticleComments(id);
    const [refreshComment, setRefreshComment] = useState(comments);
    console.log(refreshComment)
    const [checked, setChecked] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });
    const fetchComments = async () => {
        const data = await apis.comments.getComments({articleId: id});
        setRefreshComment(data);
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleSubmit = async (data: { content: string }) => {
        try {
            await apis.comments.postComments(id, {
                content: data.content,
                anonymous: checked,
            });
            console.log('댓글 작성 성공');
            form.reset();
            fetchComments();
            if (article) {
                article.commentCount += 1; // 댓글 수 증가
            }
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    }

    const handleUpdate = (id: string, content: string) => {
        setEditingCommentId(id);
        setEditingContent(content);
    }

    const handleSubmitUpdate = async () => {
        if (editingCommentId) {
            try {
                await apis.comments.patchComments(id, editingCommentId, { content: editingContent });
                setEditingCommentId(null);
                fetchComments();
            } catch (error) {
                console.error('댓글 수정 실패:', error);
            }
        }
    }

    return (
        <View className="flex-1 bg-white">
            <Header.Container>
                <Header.LeftContent>
                    <Pressable onPress={() => router.push('/community')} className="p-2 -ml-2">
                        <ChevronLeftIcon width={24} height={24} />
                    </Pressable>
                    <Header.LeftButton visible={false} />
                </Header.LeftContent>
                <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
                <Header.RightContent>
                    <TouchableOpacity>
                        <IconWrapper>
                            <HamburgerIcon />
                        </IconWrapper>
                    </TouchableOpacity>
                </Header.RightContent>
            </Header.Container>
            <ScrollView className="flex-1 px-5">
                <View>
                    {article ? (
                        <ArticleDetail article={article} comments={refreshComment} onUpdate={handleUpdate}/>
                    ) : (
                        <Text>게시글을 찾을 수 없습니다.</Text>
                    )}
                </View>
            </ScrollView>
            <View className="flex-row w-[361px] h-[50px] items-center gap-[5px] ml-[16px] mb-[32px] rounded-[16px] bg-[#F8F4FF]">
                <Check.Box className="pl-[12px] h-[25px]" checked={checked} size={25} onChange={(checked) => setChecked(checked)} />
                <Text className="mr-1 text-black text-[15px] h-[25px] flex items-center">익명</Text>
                <Form.LabelInput
                    name="content"
                    control={form.control}
                    className="w-[241px] h-[25px] pl-[5px] border-b-0 text-xs text-[#A892D7] mt-[-5px]"
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