import { TouchableOpacity, View, TextInput, Pressable, ScrollView } from "react-native";
import { BottomNavigation, Header, PalePurpleGradient, Text, Check } from "@/src/shared/ui";
import { router } from "expo-router";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useState } from "react";
import { CommunityGuideline } from "@/src/features/community/ui";

export default function CommunityWriteScreen() {
    const [checked, setChecked] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    return (
        <View className="flex-1">
            <PalePurpleGradient />
            <Header.Container>
                <Header.LeftContent>
                    <Pressable onPress={() => router.push('/community')} className="p-2 -ml-2">
                        <ChevronLeftIcon width={24} height={24} />
                    </Pressable>
                </Header.LeftContent>
                <Header.RightContent>
                    <TouchableOpacity onPress={() => router.push('/community')}>
                        <Text textColor={'black'} weight={'bold'}>
                            완료
                        </Text>
                    </TouchableOpacity>
                </Header.RightContent>
            </Header.Container>
            <ScrollView className="flex-1 ">
                <View className="h-[1px] bg-[#E7E9EC]" />
                <View className="px-[16px] pt-[26px]">
                    <View className="items-center justify-center">
                        <TextInput
                            placeholder="제목을 입력하세요."
                            className="w-full h-[28px] mb-[10px] font-bold placeholder:text-[#D9D9D9] text-[20px] border-b border-[#E7E9EC]"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            placeholder="내용을 입력하세요."
                            multiline
                            className="w-full h-[232px] text-[12px] placeholder:text-[#D9D9D9]"
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>
                </View>
                <CommunityGuideline />

            </ScrollView>
            <View className="bg-white border-t border-lightPurple ">
                <View className="flex-row justify-around py-3">
                    <View />
                    <View />
                    <View />
                    <View className="flex-row items-center gap-1 mb-1">
                        <Check.Box className="" checked={checked} size={25} onChange={(checked) => setChecked(checked)} />
                        <Text className="text-[15px] text-[#000000] font-medium">익명</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}