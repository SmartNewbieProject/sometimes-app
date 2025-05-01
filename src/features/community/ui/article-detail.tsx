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
import { useForm } from "react-hook-form";
import SendIcon from '@/assets/icons/send.svg';
import { Check } from '@/src/shared/ui/check';
import { useState } from "react";
import { useArticleComments } from "../hooks/use-article-comments";
import { mockComments } from '../mocks/articles';
import React from "react";
import { getUnivLogo, UniversityName } from "@/src/shared/libs";

export const ArticleDetail = ({article}: {article: Article}) => {
    const [checked, setChecked] = useState(true);
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });
    
    const comments = mockComments.filter(comment => comment.articleId === article.id);
    
    const handleSubmit = (data: { content: string }) => {
        console.log(data);
    }

    const renderComments = (comments: any[]) => {
        return comments
            .filter((comment: any) => !comment.repliesid)
            .map((comment: any) => {
                const replies = comments.filter((reply: any) => reply.repliesid === comment.id);
                return (
                    <React.Fragment key={comment.id}>
                        <ArticleDetailComment comment={comment} />
                        {replies.map((reply: any) => (
                            <View key={reply.id} className="ml-[20px]">
                                <ArticleDetailComment comment={reply} />
                            </View>
                        ))}
                    </React.Fragment>
                );
            });
    };

    return (
        <View className="flex-1 px-[16px] w-full h-full">
            <View className="h-[1px] bg-[#F3F0FF] mb-[15px]"/>
            <View className="flex-row items-center mb-[12px]">
                <Image 
                    source={{ uri: getUnivLogo(article.author.universityDetails.name as UniversityName) }}
                    style={{ width: 36, height: 36 }}
                    className="rounded-full mr-2"
                />
                <View>
                    <Text size="sm" weight="medium" textColor="black">{article.author.name}</Text>
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
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.likeCount}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                        <IconWrapper size={20}>
                            <CommentIcon stroke="#646464" />
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.comments.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                        <IconWrapper size={16} >
                            <EyesIcon stroke="#646464" />
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.readCount}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="h-[1px] bg-[#F3F0FF] mb-[20px]"></View>
            <View>
                {renderComments(comments)}
            </View>
            <View className="h-[1px] bg-[#FFFFFF]"></View>
            <View className=" w-full flex-row items-center justify-between px-[16px] py-[9px] rounded-[15px] bg-[#F8F4FF]">
                <View className="flex-row items-center gap-1">
                    <Check.Box className="h-[25px]" checked={checked} size={25} onChange={(checked) => setChecked(checked)} />
                    <Text className="mr-1 text-black text-[15px] h-[25px] flex items-center">익명</Text>
                    <Form.LabelInput
                        name="content"
                        control={form.control}
                        className="w-full h-[25px] border-b-0 text-xs text-[#A892D7]"
                        placeholder="댓글을 입력하세요"
                        label=""
                    />
                </View>
                <TouchableOpacity onPress={form.handleSubmit(handleSubmit)}>

                </TouchableOpacity>
            </View>
        </View>
    )
}