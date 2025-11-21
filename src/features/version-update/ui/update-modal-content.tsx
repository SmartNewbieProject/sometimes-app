import colors from "@/src/shared/constants/colors";
import {
  getAndroidStoreUrl,
  getAppStoreUrl,
  getIOSStoreUrl,
  isWeb,
} from "@/src/shared/libs/platform-utils";
import { Button, Show, Text } from "@shared/ui";
import { Image } from "expo-image";
import type React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Linking } from "react-native";
import type { VersionUpdateResponse } from "../types";


interface UpdateModalContentProps {
  updateData: VersionUpdateResponse;
  serverVersion?: string;
  currentVersion?: string;
  canSkip: boolean;
  onSkip: () => void;
}

export const UpdateModalContent: React.FC<UpdateModalContentProps> = ({
  updateData,
  currentVersion,
  serverVersion,
  canSkip,
  onSkip,
}) => {
  const handleUpdatePress = () => {
    if (isWeb) return;
    const storeUrl = getAppStoreUrl();
    Linking.openURL(storeUrl);
  };

  const handleIOSStorePress = () => {
    Linking.openURL(getIOSStoreUrl());
  };

  const handleAndroidStorePress = () => {
    Linking.openURL(getAndroidStoreUrl());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@assets/images/version-update-alert.png")}
          style={{ width: 64, height: 64 }}
        />

        <View style={{ marginTop: 14 }} />
        <Text size="20" weight="bold" textColor="black">
          {isWeb ? "새로운 업데이트가 있어요!" : "새로운 업데이트가 있어요!"}
        </Text>
        <Text size="sm" className="text-[#4B5563]" style={{ marginTop: 12 }}>
          {isWeb
            ? "앱을 설치하셔서 이용하시면 더 빠르게 서비스를 이용가능해요!"
            : "더 나은 썸타임을 위한 새로운 기능들이 추가되었습니다."}
        </Text>
      </View>

      <View style={{ marginTop: 32 }} />

      <TouchableOpacity style={styles.card} onPress={handleUpdatePress}>
        <Text
          size="md"
          textColor="black"
          weight="bold"
          style={{ marginBottom: 14 }}
        >
          ✨ 새로운 기능
        </Text>
        <View style={{ display: "flex", flexDirection: "column", rowGap: 8 }}>
          {updateData.metadata.description.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <View key={index} style={styles.descriptionLayout}>
              <View style={styles.circle} />
              <Text className="text-[#374151]">{item}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text size="sm" textColor="gray">
          현재 버전: {currentVersion}
        </Text>
        <Text size="sm" textColor="gray">
          새 버전: {serverVersion}
        </Text>
      </View>

      <View style={{ marginTop: 32 }}>
        {isWeb ? (
          <View
            style={{ display: "flex", flexDirection: "column", rowGap: 12 }}
          >
            <Button
              onPress={handleIOSStorePress}
              width="full"
              size="md"
              styles={{ width: "100%", height: 48 }}
            >
              App Store에서 다운로드
            </Button>
            <Button
              onPress={handleAndroidStorePress}
              width="full"
              size="md"
              styles={{ width: "100%", height: 48 }}
            >
              Play Store에서 다운로드
            </Button>
          </View>
        ) : (
          <Button
            onPress={handleUpdatePress}
            width="full"
            size="md"
            styles={{ width: "100%", height: 48 }}
          >
            지금 업데이트
          </Button>
        )}

        <View
          style={{
            marginTop: 12,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Show when={canSkip}>
            <TouchableOpacity onPress={onSkip}>
              <Text
                size="sm"
                textColor="gray"
                style={{ textDecorationLine: "underline" }}
              >
                이 버전 건너뛰기
              </Text>
            </TouchableOpacity>
          </Show>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  version: {
    fontSize: 18,
    color: colors.primaryPurple,
    fontWeight: 600,

    fontFamily: "semibold",
  },
  descriptionContainer: {
    maxHeight: 200,
  },
  descriptionLayout: {
    display: "flex",
    flexDirection: "row",
    columnGap: 4,
    alignItems: "center",
  },
  circle: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#A892D7",
  },
  card: {
    backgroundColor: colors.cardPurple,
    borderRadius: 12,
    padding: 16,
  },
  versionContainer: {
    width: "100%",
    marginTop: 16,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
  },
});
