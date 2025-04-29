import { FlatList, TouchableOpacity, View, Image } from 'react-native';
import { ArticleItem } from './article-item';
import { mockArticles, mockPopularArticles } from '../mocks/articles';
import { useState } from 'react';
import { IconWrapper } from '@/src/shared/ui/icons';
import VectorIcon from '@/assets/icons/Vector.svg';
import { Text } from '@/src/shared/ui';
import Community from '@features/community';
import { useCategory } from '../hooks';

const { useArticles } = Community;
interface ArticleListProps {
}

export function ArticleList({ }: ArticleListProps) {
  const { currentCategory: categoryCode } = useCategory();
  const { articles, isLoading } = useArticles({
    categoryCode,
    initialPage: 1,
    initialSize: 5,
  });

  console.table(articles);

  return (
    <View className="flex-1">
      <View className="h-[1px] bg-[#F3F0FF]" />
      <View className="bg-lightPurple/20 px-4 py-2 mt-2 flex-row items-center">
        <Image
          source={require('@/assets/images/fireIcon.png')}
          style={{ width: 22, height: 22 }}
        />
        <Text size="sm">토끼는 급해. 그래서 급사.</Text>
        <TouchableOpacity className="ml-auto">
          <IconWrapper>
            <VectorIcon className=" h-[12px] w-[9px]" color="black" />
          </IconWrapper>
        </TouchableOpacity>
      </View>
      <View className="h-[1px] bg-[#F3F0FF] mb-2" />
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <ArticleItem
            article={item}
            onPress={() => { }}
            onLike={() => { }}
            onComment={() => { }}
            onViews={() => { }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        className="flex-1"
        ItemSeparatorComponent={() => <View className="h-[1px] bg-[#F3F0FF]" />}
      />
    </View>
  );
} 
