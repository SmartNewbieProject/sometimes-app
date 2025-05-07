import { router, useLocalSearchParams } from "expo-router";
import { Header, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, Pressable } from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import HamburgerIcon from '@/assets/icons/menu-dots-vertical.svg';
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useArticleDetail } from "@/src/features/community/hooks/";
import { useForm } from "react-hook-form";

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { article } = useArticleDetail(id);
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });

    return (
        <View className="flex-1 bg-white">
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
                <View className="flex-1">
                    {article ? (
                        <ArticleDetail article={article}/>
                    ) : (
                        <Text>게시글을 찾을 수 없습니다.</Text>
                    )}
                </View>
        </View>
    )
}