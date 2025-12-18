import Slider from "@/src/widgets/slide";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import Loading from "../../loading";
import { useTotalMatchCountQuery, useTotalUserCountQuery } from "../queries";
import FirstPurchaseEvent from "./first-purchase-event-banner";
import TotalMatchCounter from "./total-match-counter";
import InvitePromotionBanner from "./banner/invite-promotion-banner";
import JapanOpeningBanner from "./banner/japan-opening-banner";

function BannerSlide() {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } =
    useTotalMatchCountQuery();
  const { data: totalUserCount = 0 } = useTotalUserCountQuery();
  const { t } = useTranslation();

  return (
    <Loading.Lottie
      title={t("features.home.ui.banner_slide.loading_title")}
      loading={isLoading}
    >
      <Slider
        autoPlay
        autoPlayInterval={5000}
        style={styles.slider}
        indicatorContainerStyle={styles.indicatorContainer}
      >
        <JapanOpeningBanner />
        <FirstPurchaseEvent />
        <InvitePromotionBanner />
        <TotalMatchCounter count={totalMatchCount + totalUserCount + 1000} />
      </Slider>
    </Loading.Lottie>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    minHeight: 92,
  },
  indicatorContainer: {
    bottom: -16,
  },
});

export default BannerSlide;