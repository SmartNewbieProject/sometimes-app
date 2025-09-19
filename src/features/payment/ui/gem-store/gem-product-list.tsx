import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GemStoreWidget } from '@/src/widgets/gem-store';
import { useGemProducts } from '../../hooks';
import { Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';

type GemProductListProps = {
  onPurchase?: (gemProductId: string, totalPrice: number) => void;
};

const GemProductList = ({ onPurchase }: GemProductListProps) => {
  const { data: gemProductsResponse, isLoading, error } = useGemProducts();
  const { t } = useTranslation();

  const handlePurchase = (metadata: { totalPrice: number; gemProduct: any }) => {
    onPurchase?.(metadata.gemProduct.id, metadata.totalPrice);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("ui.apple_gem_store.loading_gem_products")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{t("ui.gem_store.failed_to_load_gem_products")}</Text>
      </View>
    );
  }

  const gemProducts = gemProductsResponse?.data || [];

  return (
    <View style={styles.content}>
      <GemStoreWidget.Provider storeName={t("ui.gem_store.store_name")}>
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