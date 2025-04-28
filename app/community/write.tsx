import { TouchableOpacity, View, TextInput, Pressable, ScrollView } from "react-native";
import { BottomNavigation, Header, PalePurpleGradient, Text, Check } from "@/src/shared/ui";
import { router } from "expo-router";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { IconWrapper } from "@/src/shared/ui/icons";
import HamburgerIcon from '@/assets/icons/menu-dots-vertical.svg';
import { useState } from "react";

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
                <View className="h-[1px] bg-[#E7E9EC]"/>
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
                <View className="pl-[16px] pr-[10px]">
                    <Text className="text-[12px] text-[#7C7C7C] opacity-60 leading-[17.6px] pb-[9px]">썸타임 커뮤니티 이용 가이드라인</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 leading-[17.6px] pb-[9px]">안녕하세요! 썸타임 커뮤니티에 오신 것을 환영합니다. </Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[26px]">모두가 편안하고 즐겁게 소통할 수 있는 공간을 만들기 위해 아래 가이드라인을 준수해 주세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]">기본 규칙</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> 1. 상호 존중: 다른 회원의 의견과 관점을 존중해 주세요. 비방, 조롱, 혐오 발언은 삼가주세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> 2. 개인정보 보호: 본인 또는 타인의 실명, 연락처, SNS ID 등 개인정보를 공개하지 마세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> 3. 건전한 내용: 불법적이거나 선정적인, 폭력적인 내용의 게시글과 댓글은 작성하지 마세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> 4. 광고 금지: 상업적 홍보나 광고성 콘텐츠는 게시하지 마세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[26px]">게시글 작성 팁</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> ㆍ 제목은 내용을 잘 반영하도록 작성해 주세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> ㆍ 다른 회원들에게 도움이 될 수 있는 정보나 경험을 공유해 보세요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]"> ㆍ 질문이나 고민이 있다면 구체적으로 작성하면 더 좋은 답변을 받을 수 있어요.</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[26px]"> ㆍ 재미있는 데이트 장소나 활동을 공유하는 것도 좋아요!</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[9px]">신고 및 제재</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[8px] ">가이드라인을 위반하는 게시글이나 댓글은 관리자에 의해 삭제될 수 있으며, 위반 정도에 따라 계정</Text>
                    <Text className="text-[9px] text-[#7C7C7C] opacity-60 pb-[8px] ">이용이 제한될 수 있습니다. 부적절한 콘텐츠를 발견하시면 신고 기능을 통해 알려주세요.즐겁고 의미 있는 커뮤니티 활동 되세요!💕 </Text>
                </View>
            </ScrollView>
            <View className="bg-white border-t border-lightPurple ">
                <View className="flex-row justify-around py-3">
                    <View/>
                    <View title="왼쪽"/>
                    <View title="중앙"/>
                    <View title="오른쪽" className="flex-row items-center gap-1 mb-1">
                        <Check.Box className="" checked={checked} size={25} onChange={(checked) => setChecked(checked)} />
                        <Text className="text-[15px] text-[#000000] font-medium">익명</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}