import  {router, useLocalSearchParams}  from "expo-router";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, ScrollView, Pressable } from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import HamburgerIcon from '@/assets/icons/menu-dots-vertical.svg';
import { useQuery } from "@tanstack/react-query";
import { getArticle } from "@/src/features/community/apis/articles";
import { ArticleDetail } from "@/src/features/community/ui/article-detail";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: article } = useQuery({
        queryKey: ['article', id],
        queryFn: () => getArticle(id),
    });
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
                        <ArticleDetail article={article} />
                    ) : (
                        <Text>게시글을 찾을 수 없습니다.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}