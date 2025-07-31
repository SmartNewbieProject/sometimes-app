import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GemStoreWidget } from '@/src/widgets/gem-store';
import { useGemProducts } from '../../hooks';
import { Text } from '@/src/shared/ui';

type GemProductListProps = {
  onPurchase?: (gemProductId: string, totalPrice: number) => void;
};

const GemProductList = ({ onPurchase }: GemProductListProps) => {
  const { data: gemProductsResponse, isLoading, error } = useGemProducts();

  const handlePurchase = (metadata: { totalPrice: number; gemProduct: any }) => {
    onPurchase?.(metadata.gemProduct.id, metadata.totalPrice);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>젬 상품을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>젬 상품을 불러오는데 실패했습니다.</Text>
      </View>
    );
  }

  const gemProducts = gemProductsResponse?.data || [];

  return (
    <View style={styles.content}>
      <GemStoreWidget.Provider storeName="젬 상점">
        {gemProducts
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((product, index) => (
            <GemStoreWidget.Item
              key={product.id}
              gemProduct={product}
              onOpenPayment={handlePurchase}
              hot={index === 2}
            />
          ))}
      </GemStoreWidget.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export { GemProductList };