import { TouchableOpacity, View, Image, Button } from "react-native"   
import { Text } from "@/src/shared/ui"
import { Article } from "@/src/features/community/types"
import { IconWrapper } from "@/src/shared/ui/icons"
import HeartIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/engagement.svg';
import EyesIcon from '@/assets/icons/ph_eyes-fill.svg';
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { z } from "zod";
import { ArticleDetailComment } from "./article-detail-comment";
import { Form } from "@/src/widgets/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormState, useForm } from "react-hook-form";
import SendIcon from '@/assets/icons/send.svg';
import { Check } from '@/src/shared/ui/check';

const schema = z.object({
    content: z.string().min(1, { message: '댓글을 입력해주세요' }),
});

type FormState = {
    content: string;
};

export const ArticleDetail = ({article, comments}: {article: Article, comments: Comment[]}) => {
    const form = useForm<FormState>({
        resolver: zodResolver(schema),
        defaultValues: {
            content: '',
        },
    });
    return (
        <View className="flex-1 px-[16px] w-full">
            <View className="h-[1px] bg-[#F3F0FF] mb-[15px]"/>
            <View className="flex-row items-center mb-[12px]">
                <Image 
                    source={article.author.university.image}
                    style={{ width: 36, height: 36 }}
                    className="rounded-full mr-2"
                />
                <View>
                    <Text size="sm" weight="medium" textColor="black">{article.author.name}</Text>
                    <View className="flex-row items-center" style={{ alignItems: 'center'}}>
                        <Text className="text-[10px] h-[12px] text-[#7A4AE2] opacity-70" style={{ }}>
                            {article.author.age}세 
                            <Text className="text-[10px] h-[12px] opacity-70"> · </Text>
                            {article.author.university.name}
                        </Text>
                        <IconWrapper size={11}>
                            <ShieldNotSecuredIcon/>
                        </IconWrapper>
                    </View>
                </View>
            </View>
            <View>
                <Text weight="medium" className="text-[12px] mb-[5px]" textColor="black">{article.title}</Text>
                <Text className=" text-[12px] h-[28px] mb-[9px] leading-5" textColor="black">
                    {article.content}
                </Text>
            </View>
            <View className="w-[300px] px-[31px] justify-between">
                <View className="flex-row items-center justify-between gap-4">
                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                        <IconWrapper size={20}>
                            <HeartIcon stroke="#646464" />
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.likes}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                        <IconWrapper size={20}>
                            <CommentIcon stroke="#646464" />
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.comments?.length || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                        <IconWrapper size={16} >
                            <EyesIcon stroke="#646464" />
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.views || 0}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="h-[1px] bg-[#F3F0FF] mb-[20px]"></View>
            <View>
                {comments.map((comment) => (
                    <ArticleDetailComment key={comment.id} comment={comment} />
                ))}
            </View>
            <View>
                <Check />
                <Form.LabelInput
                    name="content"
                    control={form.control}
                    label="댓글"
                    textColor="black"
                    placeholder="댓글을 입력하세요"
                />
                <TouchableOpacity onPress={form.handleSubmit()}>
                    <IconWrapper>
                        <SendIcon />
                    </IconWrapper>
                </TouchableOpacity>

            </View>
        </View>
    )
}
