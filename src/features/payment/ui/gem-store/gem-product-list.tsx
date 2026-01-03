import { Text } from "@/src/shared/ui";
import { GemStoreWidget } from "@/src/widgets/gem-store";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useGemProducts } from "../../hooks";
import { useTranslation } from 'react-i18next';

type GemProductListProps = {
  onPurchase?: (gemProductId: string, totalPrice: number) => void;
};

const GemProductList = ({ onPurchase }: GemProductListProps) => {
  const { data: gemProductsResponse, isLoading, error } = useGemProducts();
  const { t } = useTranslation();

  const handlePurchase = (metadata: {
    totalPrice: number;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    gemProduct: any;
  }) => {
    onPurchase?.(metadata.gemProduct.id, metadata.totalPrice);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("features.payment.ui.apple_gem_store.loading_gem_products")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{t("features.payment.ui.gem_store.failed_to_load_gem_products")}</Text>
      </View>
    );
  }

  const gemProducts = gemProductsResponse || [];

  return (
    <View style={styles.content}>
      <GemStoreWidget.Provider>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export { GemProductList };
