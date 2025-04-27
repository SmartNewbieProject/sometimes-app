import { FlatList, TouchableOpacity, View, Image } from 'react-native';
import { ArticleItem } from './article-item';
import { mockArticles, mockPopularArticles } from '../mocks/articles';
import { useState } from 'react';
import { useArticles } from '../hooks/use-articles';
import { FilterButton } from './filter-button';
import { IconWrapper } from '@/src/shared/ui/icons';
import VectorIcon from '@/assets/icons/Vector.svg';
import { Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import WriteIcon from '@/assets/icons/write.svg';

interface ArticleListProps {
  type: 'realtime' | 'popular';
}

export function ArticleList({ type }: ArticleListProps) {
  const { handleLike, handleComment, handleViews } = useArticles();
  const [activeTab, setActiveTab] = useState<'realtime' | 'popular'| 'review'>(type);
  const [articles, setArticles] = useState(() => 
    (type === 'popular' ? mockPopularArticles : mockArticles).map(article => ({
      ...article,
    }))
  );

  const handleArticlePress = (articleId: string) => {
    const selectedArticle = articles.find(article => article.id === articleId);
    if (selectedArticle) {
      router.push(`/community/${articleId}`);
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, views: (article.views || 0) + 1 }
          : article
      ));
    } else {
      console.error('Article not found:', articleId);
    }
  };

  const handleTabChange = (tab: 'realtime' | 'popular' | 'review') => {
    setActiveTab(tab);
    const filteredArticles = (tab === 'popular' ? mockPopularArticles : mockArticles).map(article => ({
      ...article,
    }));
    setArticles(filteredArticles);
  };

  return (
    <View className="flex-1">
      <FilterButton 
        activeTab={activeTab} 
        onChangeTab={handleTabChange}
      />
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
            onPress={() => handleArticlePress(item.id)}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item.id)}
            onViews={() => handleViews(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        className="flex-1"
        ItemSeparatorComponent={() => <View className="h-[1px] bg-[#F3F0FF]" />}
      />
      <TouchableOpacity 
        onPress={() => router.push('/community/write')} 
        className="w-[60px] h-[60px] rounded-full bg-[#9747FF] items-center justify-center" 
        style={{ position: 'absolute', bottom: 0, right: 0 }}
      >
        <IconWrapper>
          <WriteIcon stroke="#FFFFFF" />
        </IconWrapper>
      </TouchableOpacity>
    </View>
  );
} 