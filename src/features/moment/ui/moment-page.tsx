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
import { useMomentAnalytics } from "../hooks/use-moment-analytics";

export const MomentPage = () => {
  const { data: slides = [], isLoading: slidesLoading } = useMomentSlidesQuery();
  const { momentEvents, featureEvents } = useKpiAnalytics();
  const queryClient = useQueryClient();
  const { trackMomentHomeView } = useMomentAnalytics();

  useFocusEffect(
    React.useCallback(() => {
      featureEvents.trackFeatureUsed('moment', 'navigation');
      trackMomentHomeView({ source: 'navigation' });

      queryClient.refetchQueries({ queryKey: ["moment", "daily-question"] });
      queryClient.refetchQueries({ queryKey: ["moment", "progress-status"] });
      queryClient.refetchQueries({ queryKey: ["moment", "moment-slides"] });

      return () => {};
    }, [queryClient, trackMomentHomeView])
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