import { IconWrapper } from "@/src/shared/ui/icons";
import { TouchableOpacity, Modal, View } from "react-native";
import { Show, Text, ImageResource, dropdownStyles } from "@/src/shared/ui";
import { Image } from "expo-image";
import CommentIcon from '@/assets/icons/engagement.svg';
import HeartIcon from '@/assets/icons/heart.svg';
import { Comment } from "../../types";
import { useEffect, useState, useRef } from 'react';
import { getUnivLogo, UniversityName, ImageResources } from "@/src/shared/libs";
import { useAuth } from "../../../auth";
import { useBoolean } from "@/src/shared/hooks/use-boolean";

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

export const ArticleDetailComment = ({ comment, onDelete, onUpdate }: { comment: Comment, onDelete: (id: string) => void , onUpdate: (id: string) => void }) => {
    const [relativeTime, setRelativeTime] = useState('');
    const { value: isDropdownOpen, toggle: toggleDropdown, setFalse: closeDropdown } = useBoolean()
    useEffect(() => {
        setRelativeTime(formatRelativeTime(comment.createdAt));
    }, [comment.createdAt]);

    const { my } = useAuth();
    const isAuthor = comment.author.id === my?.id;
    

    return (
        <View key={comment.id} className="flex-row">
            <Image 
                source={{ uri: getUnivLogo(comment.author.universityDetails.name as UniversityName) }}
                style={{ width: 24, height: 24 }}
                className="rounded-full mr-[8px]"
            />
            <View className="flex-1 ">
                <View className="pb-[6px] flex-row items-center justify-between">
                    <View className="flex-row items-center mb-[6px ]">
                        <Text className="text-[12px] text-black">
                            {comment.author.name}
                        </Text>
                        <Show when={isAuthor}>
                            <Text className="text-[8px] text-[#646464] mr-[10px]">(나)</Text>
                        </Show>
                        <Text className="text-[10px] text-[#646464]">{relativeTime}</Text>
                    </View>
                    <View className="bg-[#F3EDFF] px-[5px] py-[2px] rounded-[1px] gap-[4px] flex-row items-center text-#A892D7">
                        <Show when={!isAuthor}>
                            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => {}}>
                                <Text className="text-[10px] text-[#A892D7]">신고</Text>
                            </TouchableOpacity>
                        </Show>
                        <Show when={isAuthor}>
                            <View className="" onTouchEnd={(e) => {
                                e.stopPropagation();
                            }}>
                                <TouchableOpacity onPress={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown();
                                }}>
                                    <View className=" flex items-center justify-center">
                                        <ImageResource resource={ImageResources.MENU} width={12} height={12} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Show>
                        <Show when={isDropdownOpen}>
                            <View className="absolute top-[30px] right-0" style={{ ...dropdownStyles.dropdownContainer, zIndex: 10 }}>
                                <TouchableOpacity
                                    style={{ padding:1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        closeDropdown();
                                        onUpdate(comment.id);
                                    }}
                                >
                                    <Text textColor="black">수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{padding:1 }}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onDelete(comment.id);
                                        closeDropdown();
                                    }}
                                >
                                    <Text textColor="black">삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </Show>
                    </View>
                </View>
                <Text className="pb-[8px] text-[10px] text-black">{comment.content}</Text>
                <View className="h-[1px] bg-[#F3F0FF] mb-[10px]"></View>
            </View>

        </View>
    )
}
