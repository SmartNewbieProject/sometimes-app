import { router, useLocalSearchParams } from "expo-router";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, ScrollView, Pressable } from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import HamburgerIcon from '@/assets/icons/menu-dots-vertical.svg';
import { useQuery } from "@tanstack/react-query";
import { getArticle } from "@/src/features/community/apis/articles";
import { ArticleDetail } from "@/src/features/community/ui/article-detail";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useArticleComments, useArticleDetail } from "@/src/features/community/hooks/";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Check } from "@/src/shared/ui";
import SendIcon from '@/assets/icons/send.svg';
import { Form } from "@/src/widgets/form";

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { article } = useArticleDetail(id);
    const { comments } = useArticleComments(id);
    const [checked, setChecked] = useState(false);
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });

    const content = form.watch('content');
    const handleSubmit = (data: { content: string }) => {
        console.log(data);
        form.reset();
    }

    return (
        <View className="flex-1">
            <PalePurpleGradient />
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
                        <ArticleDetail article={article} comments={comments} />
                    ) : (
                        <Text>게시글을 찾을 수 없습니다.</Text>
                    )}
                </View>
            </ScrollView>
            <View className="flex-row w-[361px] h-[50px] items-center gap-[5px] ml-[16px] rounded-[16px] bg-[#F8F4FF]">
                <Check.Box className="pl-[12px] h-[25px]" checked={checked} size={25} onChange={(checked) => setChecked(checked)} />
                <Text className="mr-1 text-black text-[15px] h-[25px] flex items-center">익명</Text>
                <Form.LabelInput
                    name="content"
                    control={form.control}
                    className="w-[251px] h-[25px] pl-[5px] border-b-0 text-xs text-[#A892D7]"
                    placeholder="댓글을 입력하세요"
                    label=""
                />
                <TouchableOpacity onPress={form.handleSubmit(handleSubmit)} disabled={!content}>
                    <IconWrapper size={18}>
                        <SendIcon />
                    </IconWrapper>
                </TouchableOpacity>
            </View>
        </View>
    )
}