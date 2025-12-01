import { FlatList, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { Article } from './article';
import { IconWrapper } from '@/src/shared/ui/icons';
import VectorIcon from '@/assets/icons/Vector.svg';
import { Text } from '@/src/shared/ui';
import { useCategory, useArticles } from '../hooks';

interface ArticleListProps {
  initialSize?: number;
  infiniteScroll?: boolean;
}

export function ArticleList({ initialSize = 10, infiniteScroll = true }: ArticleListProps) {
  const { currentCategory: categoryCode } = useCategory();
  const result = useArticles({
    categoryCode,
    initialPage: 1,
    initialSize,
    infiniteScroll,
  });

  const {
    articles,
    isLoading,
  } = result;

  const isLoadingMore = infiniteScroll ? result.isLoadingMore : false;
  const scrollProps = infiniteScroll ? result.scrollProps : {};

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-4 flex items-center justify-center">
        <ActivityIndicator size="small" color="#8C6AE3" />
      </View>
    );
  };

  if (isLoading && articles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#8C6AE3" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="h-[1px] bg-surface-other" />
      <TouchableOpacity className="bg-lightPurple/20 px-4 py-2 mt-2 flex-row items-center">
        <Image
          source={require('@/assets/images/fireIcon.png')}
          style={{ width: 22, height: 22 }}
        />
        <Text size="sm">[FAQ] 자주묻는 질문</Text>
        <TouchableOpacity className="ml-auto">
          <IconWrapper>
            <VectorIcon className=" h-[12px] w-[9px]" color="black" />
          </IconWrapper>
        </TouchableOpacity>
      </TouchableOpacity>
      <View className="h-[1px] bg-surface-other mb-2" />

      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <Article
            data={item}
            onPress={() => { }}
            onLike={() => { }}
            onComment={() => { }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        className="flex-1 scrolling"
        ItemSeparatorComponent={() => <View className="h-[1px] bg-surface-other" />}
        ListFooterComponent={renderFooter}
        {...scrollProps}
        onEndReached={infiniteScroll ? (info) => {
          console.log('onEndReached triggered', info);
          if (result.loadMore) {
            result.loadMore();
          }
        } : undefined}

        onMomentumScrollBegin={() => {
          console.log('onMomentumScrollBegin triggered');
        }}
      />
    </View>
  );
}
