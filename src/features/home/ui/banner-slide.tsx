import Slider from "@/src/widgets/slide";
import React from "react";
import { StyleSheet, View } from "react-native";
import Loading from "../../loading";
import { useTotalMatchCountQuery, useTotalUserCountQuery } from "../queries";
import FirstPurchaseEvent from "./first-purchase-event-banner";
import TotalMatchCounter from "./total-match-counter";

function BannerSlide() {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } =
    useTotalMatchCountQuery();
  const { data: totalUserCount = 0 } = useTotalUserCountQuery();

  return (
    <Loading.Lottie title="몇 명이 매칭을 신청했을까요?" loading={isLoading}>
      <Slider
        indicatorContainerClassName="!bottom-[-14px] "
        autoPlay
        autoPlayInterval={5000}
        className="w-full !min-h-[92px] "
      >
        <FirstPurchaseEvent />
        <TotalMatchCounter count={totalMatchCount + totalUserCount + 1000} />
      </Slider>
    </Loading.Lottie>
  );
}

const styles = StyleSheet.create({});

export default BannerSlide;
