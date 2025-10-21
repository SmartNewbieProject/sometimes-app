import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";
import { Time } from "@/src/features/idle-match-timer/ui";
import { sideStyle } from "@/src/features/idle-match-timer/ui/constants";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  type LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconWrapper } from "../../../shared/ui/icons";
import { Text } from "../../../shared/ui/text";
import { useAuth } from "../../auth";
import MockInteractionNavigation from "./mock-interaction-navigation";

function MockPartner() {
  const [width, setWidth] = useState(0);
  const { my } = useAuth();
  const onLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;

    setWidth(layoutWidth);
  };
  return (
    <>
      <ImageBackground
        source={{
          uri:
            my.gender === "FEMALE"
              ? "https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_man_0.png"
              : "https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_woman_0.png",
        }}
        onLayout={onLayout}
        style={[
          styles.imageBackground,
          {
            height: width,
          },
        ]}
      >
        <View
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            padding: 14,
          }}
          className="flex flex-col justify-between"
        >
          <View className="flex flex-row gap-x-[2px]">
            <Time size="sm" value={"D"} />
            <Time size="sm" value="-" />
            {"04"
              ?.toString()
              .split("")
              .map((value, index) => (
                <Time
                  size="sm"
                  key={`${value}-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    index
                  }`}
                  value={value}
                />
              ))}
          </View>

          <View
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              left: 12,
              bottom: 28,
              zIndex: 10,
            }}
          >
            <Text textColor="white" weight="semibold" size="lg">
              {21}
            </Text>
            <View className="flex flex-row items-center">
              <Text textColor="white" weight="light" size="md">
                #ISTJ #김지안
              </Text>

              <IconWrapper style={{ marginLeft: 5 }} size={14}>
                <NotSecuredIcon />
              </IconWrapper>
            </View>
          </View>

          <View
            style={{
              position: "absolute",
              width: 58,
              flexDirection: "column",
              height: 128,
              backgroundColor: "rgba(0, 0, 0, 0)",
              right: 0,
              zIndex: 10,
              bottom: 62,
            }}
          >
            <View
              style={{
                width: "100%",
                position: "relative",
                backgroundColor: "rgba(0, 0, 0, 0)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  borderBottomRightRadius: 16,
                  borderTopEndRadius: 16,
                  height: 35,
                  width: "100%",
                  borderColor: "#E7E9EC",
                }}
              />
            </View>

            <View className="w-full flex flex-row">
              <TouchableOpacity
                className="bg-primaryPurple flex-1 flex flex-row justify-end items-center pr-1"
                style={sideStyle.previousButton}
                onPress={() => {}}
              >
                <Text className="w-[32px] text-white text-[12px]">더보기</Text>
                <IconWrapper width={12} height={12}>
                  <ArrowRight />
                </IconWrapper>
              </TouchableOpacity>
            </View>
            <View
              className="w-full relative"
              style={{
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  borderTopEndRadius: 16,
                  height: 35,
                  width: "100%",
                }}
              />
            </View>
          </View>
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              left: 0,
              right: 0,
              height: "40%", // 그라데이션 높이 조절
            }}
          />
        </View>
      </ImageBackground>
      <MockInteractionNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
  },
  imageBackground: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});

export default MockPartner;
