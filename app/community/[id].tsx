import  {useLocalSearchParams}  from "expo-router";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, ScrollView } from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import BellIcon from '@/assets/icons/bell.svg';
import { useQuery } from "@tanstack/react-query";
import { getArticle } from "@/src/features/community/apis/articles";

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
                <Header.LeftButton visible={false} />
            </Header.LeftContent>
            <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
            <Header.RightContent>
                <TouchableOpacity>
                    <IconWrapper>
                        <BellIcon />
                    </IconWrapper>
                </TouchableOpacity>
            </Header.RightContent>
         </Header.Container>
         <ScrollView className="flex-1 px-5">
            <View>
                <Text>{article?.title}</Text>
                <Text>{article?.content}</Text>
            </View>
         </ScrollView>
    </View>
  )
}