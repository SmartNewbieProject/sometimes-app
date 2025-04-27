import { TouchableOpacity, View, TextInput } from "react-native";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Pressable } from "react-native";
import { router } from "expo-router";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { IconWrapper } from "@/src/shared/ui/icons";
import HamburgerIcon from '@/assets/icons/menu-dots-vertical.svg';

export default function CommunityWriteScreen() {
    return (
        <View className="flex-1">
            <PalePurpleGradient />
            <Header.Container>
                <Header.LeftContent>
                    <Pressable onPress={() => router.push('/community')} className="p-2 -ml-2">
                        <ChevronLeftIcon width={24} height={24} />
                    </Pressable>
                </Header.LeftContent>
                <Text textColor={'black'} weight={'bold'}>글 쓰기</Text>
                <Header.RightContent>
                    <TouchableOpacity>
                        <Text textColor={'black'} weight={'bold'}>
                            완료
                        </Text>
                    </TouchableOpacity>
                </Header.RightContent>
            </Header.Container>
            <View className="flex-1 px-5">
                <View className="flex-row items-center justify-center">
                    <TextInput
                        placeholder="제목을 입력하세요"
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
                    />
                    <TextInput
                        placeholder="내용을 입력하세요"
                        multiline
                        style={{ height: 200, borderColor: 'gray', borderWidth: 1, textAlignVertical: 'top', paddingHorizontal: 10 }}
                    />
                </View>
            </View>
        </View>
    )
}