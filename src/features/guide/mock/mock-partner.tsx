import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";
import { semanticColors } from '@/src/shared/constants/colors';
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
          style={[
            styles.imageContainer,
            {
              position: "relative",
              width: "100%",
              height: "100%",
              padding: 14,
            }
          ]}
        >
          <View style={styles.timeContainer}>
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
            <View style={styles.profileContainer}>
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
                  borderColor: semanticColors.border.default,
                }}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.moreButton, sideStyle.previousButton]}
                onPress={() => {}}
              >
                <Text style={styles.moreButtonText}>더보기</Text>
                <IconWrapper width={12} height={12}>
                  <ArrowRight />
                </IconWrapper>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.bottomRow,
                {
                  overflow: "hidden",
                }
              ]}
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
  imageContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
  },
  moreButton: {
    backgroundColor: semanticColors.primaryPurple,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 4,
  },
  moreButtonText: {
    width: 32,
    color: semanticColors.text.inverse,
    fontSize: 12,
  },
  bottomRow: {
    width: '100%',
    position: 'relative',
  },
});

export default MockPartner;
