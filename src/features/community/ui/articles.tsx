import { FlatList, TouchableOpacity, View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Article } from './article';
import { IconWrapper } from '@/src/shared/ui/icons';
import VectorIcon from '@/assets/icons/Vector.svg';
import { Text } from '@/src/shared/ui';
import { useCategory, useArticles } from '../hooks';
import { semanticColors } from '@/src/shared/constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoading: {
    paddingVertical: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: "#E2D5FF",
  },
  faqContainer: {
    backgroundColor: "#E2D5FF33", // 20% opacity
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    width: 22,
    height: 22,
  },
  faqButton: {
    marginLeft: 'auto',
  },
  vectorIcon: {
    height: 12,
    width: 9,
  },
  list: {
    flex: 1,
  },
});

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
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={semanticColors.brand.primary} />
      </View>
    );
  };

  if (isLoading && articles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={semanticColors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.faqContainer}>
        <Image
          source={require('@/assets/images/fireIcon.png')}
          style={styles.faqIcon}
        />
        <Text size="sm">[FAQ] 자주묻는 질문</Text>
        <TouchableOpacity style={styles.faqButton}>
          <IconWrapper>
            <VectorIcon style={styles.vectorIcon} color="black" />
          </IconWrapper>
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={[styles.divider, { marginBottom: 8 }]} />

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
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
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
