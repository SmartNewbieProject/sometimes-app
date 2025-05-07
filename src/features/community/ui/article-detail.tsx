import { TouchableOpacity, View, Image, Button, ScrollView } from "react-native"   
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
import { getUnivLogo, tryCatch, UniversityName } from "@/src/shared/libs";
import { Comment } from "../types";
import apis from "../apis";
import Interaction from "./article/interaction-nav";

export const ArticleDetail = ({article, comments}: {article: Article, comments: Comment[]}) => {
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });
    console.log(article.isLiked)
    const [likeCount, setLikeCount] = useState(article.likeCount);
    const [isLiked, setIsLiked] = useState(article.isLiked);

    const like = (item: Article) => {
      tryCatch(async () => {
        await apis.articles.doLike(item);
        setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
        setIsLiked(!isLiked);
      }, (error) => {
        console.error('좋아요 업데이트 실패:', error);
      });
    };

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
                <Text className=" text-[12px] h-[full] mb-[9px] leading-5" textColor="black">
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
            <View>
                {renderComments(comments)}
            </View>
            <View className="h-[1px] bg-[#FFFFFF]"/>
        </View>
    )
}