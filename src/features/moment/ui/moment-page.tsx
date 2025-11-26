import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import colors from "@/src/shared/constants/colors";
import { useKpiAnalytics } from "@/src/shared/hooks";

import { MomentHeader } from "./moment-header";
import { MomentSlides } from "./slides";
import { MomentNavigationMenu } from "./navigation-menu";
import { useMomentSlidesQuery, prefetchDailyQuestion } from "../queries";
import { MOMENT_NAVIGATION_ITEMS } from "../constants/navigation-data";
import { useQueryClient } from "@tanstack/react-query";

export const MomentPage = () => {
  const { data: slides = [], isLoading: slidesLoading } = useMomentSlidesQuery();
  const { momentEvents, featureEvents } = useKpiAnalytics();
  const queryClient = useQueryClient();

  // 페이지가 focus 될 때마다 데이터 refetch
  useFocusEffect(
    React.useCallback(() => {
      // KPI 이벤트: 모먼트 기능 사용
      featureEvents.trackFeatureUsed('moment', 'navigation');

      // 관련 쿼리들 refetch
      queryClient.refetchQueries({ queryKey: ["moment", "daily-question"] });
      queryClient.refetchQueries({ queryKey: ["moment", "progress-status"] });
      queryClient.refetchQueries({ queryKey: ["moment", "moment-slides"] });

      return () => {
        // cleanup (필요시)
      };
    }, [queryClient])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MomentHeader />

        {!slidesLoading && slides.length > 0 && (
          <MomentSlides
            items={slides}
            autoPlayInterval={5000}
            height={248}
          />
        )}

        <View style={styles.navigationContainer}>
          <MomentNavigationMenu
            items={MOMENT_NAVIGATION_ITEMS.slice(0, 2)}
            itemHeight={'lg'}
            itemsPerRow={2}
          />

          <MomentNavigationMenu
            items={MOMENT_NAVIGATION_ITEMS.slice(2, 5)}
            itemHeight={'md'}
            itemsPerRow={3}
          />

          <MomentNavigationMenu
            items={MOMENT_NAVIGATION_ITEMS.slice(5, 6)}
            itemHeight={'md'}
            itemsPerRow={1}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
  },
  navigationContainer: {
    width: '100%',
    marginTop: 24,
    marginBottom: 48,
  },
});