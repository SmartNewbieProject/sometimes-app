import { IconWrapper } from "@/src/shared/ui/icons";
import { TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import CommentIcon from '@/assets/icons/engagement.svg';
import HeartIcon from '@/assets/icons/heart.svg';
import HambergIcon from '@/assets/icons/menu-dots-vertical-purple.svg';
import { Comment } from "../types";
import { View } from "react-native"
import { useEffect, useState } from 'react';

const formatRelativeTime = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes} 분 전`;
    if (hours < 24) return `${hours} 시간 전`;
    return `${Math.floor(hours / 24)} 일 전`;
}

export const ArticleDetailComment = ({comment}: {comment: Comment}) => {
    const [relativeTime, setRelativeTime] = useState('');

    useEffect(() => {
        setRelativeTime(formatRelativeTime(comment.createdAt));
    }, [comment.createdAt]);

    return (
        <View key={comment.id}>
            <View className=" flex-row">

                <Image 
                    source={comment.author.university.image}
                    style={{ width: 24, height: 24 }}
                    className="rounded-full mr-[8px]"
                />
                <View className="flex-1 ">
                    <View className="pb-[6px] flex-row items-center justify-between">
                        <View className="flex-row items-center mb-[6px ]">
                            <Text className="text-[12px] mr-[6px] text-black">{comment.author.name}</Text>
                            <Text className="text-[10px] text-[#646464]">{relativeTime}</Text>
                        </View>
                        <View className="bg-[#F3EDFF] px-[5px] py-[2px] rounded-[1px] gap-[4px] flex-row items-center text-#A892D7">
                            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                                <IconWrapper size={12}>
                                    <CommentIcon stroke="#A892D7" />
                                </IconWrapper>
                            </TouchableOpacity>
                            <Text className="opacity-70 text-[6px]">|</Text>
                            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                                <IconWrapper size={12}>
                                    <HeartIcon stroke="#A892D7" />
                                </IconWrapper>
                            </TouchableOpacity>
                            <Text className="opacity-70 text-[6px]">|</Text>
                            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                                <IconWrapper size={12} >
                                    <HambergIcon  />
                                </IconWrapper>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="pb-[8px] text-[10px] text-black">{comment.content}</Text>
                    <View className="h-[1px] bg-[#F3F0FF] mb-[10px]"></View>
                </View>
            </View>
        </View>
    )
}
