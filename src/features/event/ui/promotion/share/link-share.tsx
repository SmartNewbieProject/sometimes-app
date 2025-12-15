import CopyLinkIcon from "@assets/icons/promotion/invite-code/copy-link.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import useShare from "../../../hooks/promotion/use-share";

function LinkShare() {
  const { handleShareLink } = useShare();

  return (
    <Pressable onPress={handleShareLink} style={styles.button}>
      <View style={styles.logoContainer}>
        <CopyLinkIcon width={24} height={24} />
      </View>
      <View>
        <Text style={styles.text}>링크 복사</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    gap: 10,
    backgroundColor: semanticColors.brand.primary,
    height: 54,
    borderRadius: 9999,
    justifyContent: "center",
  },
  logoContainer: {
    width: 24,
    height: 24,
  },
  text: {
    color: semanticColors.text.inverse,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
  },
});

export default LinkShare;
