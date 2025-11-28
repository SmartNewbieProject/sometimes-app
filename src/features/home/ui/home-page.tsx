import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import { Header } from "./header";
import { ImageSlide } from "./image-slide";
import { NavigationMenu } from "./navigation-menu";
import { useHomeBannersQuery } from "../queries";
import { useNavigationData } from "../hooks/use-navigation-data";
import colors from "@/src/shared/constants/colors";

export const HomePage = () => {
  const { data: banners = [], isLoading: bannersLoading } = useHomeBannersQuery();
  const navigationItems = useNavigationData();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        {/* 이미지 슬라이드 */}
        {!bannersLoading && banners.length > 0 && (
          <ImageSlide
            items={banners}
            autoPlayInterval={5000}
            width="100%"
            height={248}
          />
        )}

        {/* 네비게이션 메뉴 */}
        <NavigationMenu
          items={navigationItems}
          itemHeight={120}
          itemsPerRow={2}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    maxWidth: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    maxWidth: '100%',
    alignItems: 'center',
  },
});