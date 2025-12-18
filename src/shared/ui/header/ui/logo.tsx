import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/src/shared/ui/text";
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from "@/assets/icons/small-title.svg";
import colors from "@/src/shared/constants/colors";

interface LogoProps {
  title?: string;
  showLogo?: boolean;
  logoSize?: number;
}

export function Logo({ title, showLogo = true, logoSize = 32 }: LogoProps) {
  return (
    <View style={styles.container}>
      {showLogo ? (
        <IconWrapper width={logoSize} color={colors.primaryPurple}>
          <SmallTitle />
        </IconWrapper>
      ) : (
        <Text size="20" weight="bold" textColor="black">
          {title || "SOMETIME"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
