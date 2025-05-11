import { router, useLocalSearchParams } from "expo-router";
import { dropdownStyles, Header, ImageResource, Show, Text } from "@/src/shared/ui";
import { TouchableOpacity, View, Pressable, Modal } from "react-native";
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useArticleDetail } from "@/src/features/community/hooks/";
import { useAuth } from "@/src/features/auth";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import apis from "@/src/features/community/apis";
import Loading from "@/src/features/loading";
import { Dropdown } from '@/src/shared/ui/dropdown';
import { ImageResources } from "@/src/shared/libs";
import React, { useRef, useState } from "react";

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { article, isLoading } = useArticleDetail(id);
    const { value: isDropdownOpen, toggle: toggleDropdown, setFalse: closeDropdown } = useBoolean();
    const { my } = useAuth();
    const isOwner = (() => {
			if (!my) return false;
			return my.id === article?.author.id;
    })();
    const buttonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });

    const handleDelete = async () => {
			try {
				await apis.articles.deleteArticle(id);
				router.push('/community');
			} catch (error) {
					console.error(error);
			}
    }

    const handleMenuPress = () => {
        if (buttonRef.current) {
            buttonRef.current.measure((fx, fy, width, height, px, py) => {
                setDropdownPos({ x: px, y: py + height });
                toggleDropdown();
            });
        }
    };

		if (isLoading || !article) {
			return <Loading.Page title="게시글을 불러오고 있어요" />;
		}

    return (
        <View className="flex-1 relative bg-white">
            <Header.Container>
							<Header.LeftContent>
									<Pressable onPress={() => router.push('/community')} className="p-2 -ml-2">
										<ChevronLeftIcon width={24} height={24} />
									</Pressable>
									<Header.LeftButton visible={false} />
                </Header.LeftContent>
                <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
                <Header.RightContent>
                    <Show when={isOwner}>
                        <View>
                            <TouchableOpacity
                                ref={buttonRef}
                                onPress={handleMenuPress}
                            >
                                <View className="w-[48px] h-[48px] flex items-center justify-center">
                                    <ImageResource resource={ImageResources.MENU} width={24} height={24} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Show>
                </Header.RightContent>

            </Header.Container>
            <Modal
                visible={isDropdownOpen}
                transparent
                onRequestClose={closeDropdown}
            >
                <TouchableOpacity 
                    style={{ 
                        flex: 1,
                        backgroundColor: 'transparent'
                    }} 
                    activeOpacity={1} 
                    onPress={closeDropdown}
                >
                    <View style={[
                        dropdownStyles.dropdownContainer,
                        {
                            position: 'absolute',
                            top: dropdownPos.y,
                            left: dropdownPos.x-160,
                            width: 160,
                            zIndex: 9999
                        }
                    ]}>
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
                </TouchableOpacity>
            </Modal>

            <View className="flex-1">
                <ArticleDetail article={article}/>
            </View>
        </View>
    )
}