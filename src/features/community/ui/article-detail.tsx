import { TouchableOpacity, View, Image, Button } from "react-native"   
import { Text } from "@/src/shared/ui"
import { Article } from "@/src/features/community/types"
import { IconWrapper } from "@/src/shared/ui/icons"
import HeartIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/engagement.svg';
import EyesIcon from '@/assets/icons/ph_eyes-fill.svg';
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { ArticleDetailComment } from "./article-detail-comment";
import { Form } from "@/src/widgets/form";
import { useForm } from "react-hook-form";
import FillHeartIcon from '@/assets/icons/fill-heart.svg';
import { Check } from '@/src/shared/ui/check';
import { useState } from "react";
import React from "react";
import { getUnivLogo, UniversityName } from "@/src/shared/libs";
import { Comment } from "../types";


export const ArticleDetail = ({article, comments}: {article: Article, comments: Comment[]}) => {
    const [checked, setChecked] = useState(true);
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });
    
    
    const handleSubmit = (data: { content: string }) => {
        console.log(data);
    }

    const renderComments = (comments: Comment[]) => {
        return comments
            .map((comment: Comment) => {
                return (
                    <React.Fragment key={comment.id}>
                        <ArticleDetailComment comment={comment} />
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
                            {article.isLiked ? <FillHeartIcon /> : <HeartIcon stroke="#646464" />}
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.likeCount}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                        <IconWrapper size={20}>
                            <CommentIcon stroke="#646464" />
                        </IconWrapper>
                        <Text className="text-[16px] h-[24px] text-[#646464]">{article.comments.length}</Text>
                    </TouchableOpacity>
                    <IconWrapper size={16} >
                        <EyesIcon stroke="#646464" />
                    </IconWrapper>
                    <Text className="text-[16px] h-[24px] text-[#646464]">{article.readCount}</Text>
                </View>
            </View>
            <View className="h-[1px] bg-[#F3F0FF] mb-[20px]"></View>
            <View>
                {renderComments(comments)}
            </View>
            <View className="h-[1px] bg-[#FFFFFF]"></View>

        </View>
    )
}