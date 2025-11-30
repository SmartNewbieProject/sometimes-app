import type { ModalOptions } from "@/src/shared/providers/modal-provider";
import { semanticColors } from '@/src/shared/constants/colors';
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Banner from "../ui/roulette/banner";

export const rouletteModalStrategy = (
  showNestedModal: (options: ModalOptions) => void,
  onClick: () => void
) => ({
  0: () =>
    showNestedModal({
      customTitle: <Text style={styles.modalTitle}>오늘은 관망의 날</Text>,
      banner: (
        <Banner>
          <Banner.Zero />
        </Banner>
      ),
      children: (
        <View style={styles.modalChildren}>
          <Text style={styles.modalChildrenText}>
            급하게 다가가기보다 상대의 마음을
          </Text>
          <Text style={styles.modalChildrenText}>천천히 지켜보는게 좋아요</Text>
        </View>
      ),
      primaryButton: {
        text: "닫기",
        onClick,
      },
      showLogo: (
        <View
          style={{
            padding: 5,
            borderRadius: 999,
            backgroundColor: semanticColors.brand.primary,
          }}
        >
          <Image
            source={require("@assets/images/roulette-modal.png")}
            style={{ width: 40, height: 40 }}
          />
        </View>
      ),
    }),
  1: () =>
    showNestedModal({
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text style={styles.modalTitle}>작은 떨림 감지</Text>
        </View>
      ),

      banner: (
        <Banner>
          <Banner.One />
        </Banner>
      ),
      children: (
        <View style={styles.modalChildren}>
          <Text style={styles.modalChildrenText}>사소한 대화에서도</Text>
          <Text style={styles.modalChildrenText}>
            상대방의 마음이 스며들 수 있어요
          </Text>
        </View>
      ),
      ...flyweight(onClick),
    }),
  2: () =>
    showNestedModal({
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text style={styles.modalTitle}>두근거림이 포착돼요</Text>
        </View>
      ),
      banner: (
        <Banner>
          <Banner.Two />
        </Banner>
      ),
      children: (
        <View style={styles.modalChildren}>
          <Text style={styles.modalChildrenText}>좋아하는 사람에게</Text>
          <Text style={styles.modalChildrenText}>
            조금 더 마음을 열어도 좋은 날이에요
          </Text>
        </View>
      ),
      ...flyweight(onClick),
    }),
  3: () =>
    showNestedModal({
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text style={styles.modalTitle}>연애운 상승 곡선</Text>
        </View>
      ),
      banner: (
        <Banner>
          <Banner.Three />
        </Banner>
      ),
      children: (
        <View style={styles.modalChildren}>
          <Text style={styles.modalChildrenText}>
            대화의 흐름이 부드럽게 이어지고
          </Text>
          <Text style={styles.modalChildrenText}>호감이 쌓여가는 하루에요</Text>
        </View>
      ),
      ...flyweight(onClick),
    }),
  4: () =>
    showNestedModal({
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text style={styles.modalTitle}>좋은 만남의 조짐</Text>
        </View>
      ),
      banner: (
        <Banner>
          <Banner.Four />
        </Banner>
      ),
      children: (
        <View style={styles.modalChildren}>
          <Text style={styles.modalChildrenText}>
            새로운 인연이 들어오거나,
          </Text>
          <Text style={styles.modalChildrenText}>
            오래된 관계가 한 단계 더 깊어질 수 있어요
          </Text>
        </View>
      ),
      ...flyweight(onClick),
    }),
  5: () =>
    showNestedModal({
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text style={styles.modalTitle}>최고의 러브데이</Text>
        </View>
      ),
      banner: (
        <Banner>
          <Banner.Five />
        </Banner>
      ),
      children: (
        <View style={styles.modalChildren}>
          <Text style={styles.modalChildrenText}>
            마음이 통하는 순간이 찾아옵니다
          </Text>
          <Text style={styles.modalChildrenText}>
            사랑의 신이 미소 짓는 하루!
          </Text>
        </View>
      ),
      ...flyweight(onClick),
    }),
});

const flyweight = (onClick: () => void) => ({
  primaryButton: {
    text: "구슬 받기",
    onClick,
  },
  showLogo: (
    <View
      style={{
        padding: 5,
        borderRadius: 999,
        backgroundColor: semanticColors.brand.primary,
      }}
    >
      <Image
        source={require("@assets/images/roulette-modal.png")}
        style={{ width: 40, height: 40 }}
      />
    </View>
  ),
  showParticle: true,
});

const styles = StyleSheet.create({
  modalChildrenText: {
    fontSize: 15,
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    lineHeight: 21,
    color: semanticColors.text.primary,
  },
  modalChildren: {
    alignItems: "center",
  },
  modalTitle: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Pretendard-Bold",
    lineHeight: 24,
  },
  particle1: {
    position: "absolute",
    left: 0,
    top: -54,
    width: 66,
    height: 34,
  },
  particle2: {
    position: "absolute",
    left: 28,
    top: -118,
    width: 52,
    height: 49,
  },
  particle3: {
    position: "absolute",
    right: -10,
    top: -104,
    width: 105,
    height: 80,
  },
});
