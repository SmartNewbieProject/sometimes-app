import { FlatList, TouchableOpacity, View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Article } from './article';
import { IconWrapper } from '@/src/shared/ui/icons';
import VectorIcon from '@/assets/icons/Vector.svg';
import { Text } from '@/src/shared/ui';
import { useCategory, useArticles } from '../hooks';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';

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

  const articles = result?.articles ?? [];
  const isLoading = result?.isLoading ?? false;

  const isLoadingMore = infiniteScroll && result ? result.isLoadingMore : false;
  const scrollProps = infiniteScroll && result ? result.scrollProps : {};

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8C6AE3" />
      </View>
    );
  };

  if (isLoading && articles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8C6AE3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      <TouchableOpacity style={styles.faqButton}>
        <Image
          source={require('@/assets/images/fireIcon.webp')}
          style={styles.faqIcon}
        />
        <Text size="sm">[FAQ] 자주묻는 질문</Text>
        <TouchableOpacity style={styles.faqArrow}>
          <IconWrapper>
            <VectorIcon width={9} height={12} color="black" />
          </IconWrapper>
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.separatorWithMargin} />

      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <Article
            data={item}
            onPress={() => { }}
            onLike={() => { }}
            onDelete={() => { }}
            refresh={() => { }}
            isPreviewOpen={false}
            onTogglePreview={() => { }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={renderFooter}
        {...scrollProps}
        onEndReached={infiniteScroll ? (info) => {
          console.log('onEndReached triggered', info);
          if (result?.loadMore) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
  },
  separatorWithMargin: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
    marginBottom: 8,
  },
  faqButton: {
    backgroundColor: `${colors.lightPurple}33`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  faqIcon: {
    width: 22,
    height: 22,
  },
  faqArrow: {
    marginLeft: "auto",
  },
  list: {
    flex: 1,
  },
});
