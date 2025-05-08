import { router, useLocalSearchParams } from "expo-router";
import { dropdownStyles, Header, ImageResource, Show, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, Pressable } from "react-native";
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useArticleDetail } from "@/src/features/community/hooks/";
import { useForm } from "react-hook-form";
import { ImageResources } from "@/src/shared/libs";
import { useAuth } from "@/src/features/auth";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import apis from "@/src/features/community/apis";

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { article } = useArticleDetail(id);
    const { value: isDropdownOpen, toggle: toggleDropdown, setFalse: closeDropdown } = useBoolean();
    const form = useForm({
        defaultValues: {
            content: '',
        },
    });
    const { my } = useAuth();
    const isOwner = (() => {
        if (!my) return false;
        return my.id === article?.author.id;
    })();

    const handleDelete = async () => {
        try {
            await apis.articles.deleteArticle(id);
            router.push('/community');
        } catch (error) {
            console.error(error);
        }
    }

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
                        <Show when={!isOwner}>
                            <View className="">
                                <Text>신고</Text>
                            </View>
                        </Show>
                        <Show when={isOwner}>
                            <View className="" onTouchEnd={(e) => {
                                e.stopPropagation();
                            }}>
                                <TouchableOpacity onPress={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown();
                                }}>
                                    <View className="w-[48px] h-[48px] flex items-center justify-center">
                                        <ImageResource resource={ImageResources.MENU} width={24} height={24} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Show>
                        <Show when={isDropdownOpen}>
                            <View style={dropdownStyles.dropdownContainer}>
                                <TouchableOpacity
                                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        closeDropdown();
                                        router.push(`/community/update/${id}`);
                                    }}
                                >
                                    <Text textColor="black">수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ padding: 10 }}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                        closeDropdown();
                                    }}
                                >
                                    <Text textColor="black">삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </Show>
                    </TouchableOpacity>
                </Header.RightContent>
            </Header.Container>
            <View className="flex-1">
                {article ? (
                    <ArticleDetail article={article} />
                ) : (
                    <Text>게시글을 찾을 수 없습니다.</Text>
                )}
            </View>
        </View>
    )
}