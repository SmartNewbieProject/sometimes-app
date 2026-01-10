import Slider from "@/src/widgets/slide";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import Loading from "../../loading";
import {
  useBannersQuery,
  useTotalMatchCountQuery,
  useTotalUserCountQuery,
} from "../queries";
import FirstPurchaseEvent from "./first-purchase-event-banner";
import TotalMatchCounter from "./total-match-counter";
import InvitePromotionBanner from "./banner/invite-promotion-banner";
import ServerBanner from "./banner/server-banner";

function BannerSlide() {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } =
    useTotalMatchCountQuery();
  const { data: totalUserCount = 0 } = useTotalUserCountQuery();
  const { data: serverBanners = [] } = useBannersQuery("home");
  const { t } = useTranslation();

  const sortedServerBanners = useMemo(
    () => [...serverBanners].sort((a, b) => a.order - b.order),
    [serverBanners]
  );

  const allBanners = useMemo(
    () => [
      ...sortedServerBanners.map((banner) => (
        <ServerBanner key={banner.id} banner={banner} />
      )),
      <FirstPurchaseEvent key="purchase" />,
      <InvitePromotionBanner key="invite" />,
      <TotalMatchCounter
        key="counter"
        count={totalMatchCount + totalUserCount + 1000}
      />,
    ],
    [sortedServerBanners, totalMatchCount, totalUserCount]
  );

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
        {allBanners}
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