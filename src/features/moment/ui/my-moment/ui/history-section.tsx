import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";

import { router } from "expo-router";

export const HistorySection = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push("/moment/my-moment-record")}
      >
        <View style={styles.textContainer}>
          <Text size="md" weight="bold" textColor="dark" style={styles.title}>
            {t('features.moment.my_moment.history.my_moment_record')}
          </Text>
          <Text size="12" weight="normal" textColor="gray">
            {t('features.moment.my_moment.history.weekly_analysis')}
          </Text>
        </View>
        <Text size="20" weight="light" textColor="gray" style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* TODO: 답변 기록 활성화 필요 */}
      {/* <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push("/moment/my-answers")}
      >
        <View style={styles.textContainer}>
          <Text size="md" weight="bold" textColor="dark" style={styles.title}>
            내 답변 기록
          </Text>
          <Text size="12" weight="normal" textColor="gray">
            그동안 답변한 오늘의 질문을 확인할 수 있어요
          </Text>
        </View>
        <Text size="20" weight="light" textColor="gray" style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  listItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  arrow: {
    color: colors["gray-300"],
  },
});
