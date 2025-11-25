import { Text } from "@/src/shared/ui";
import { semanticColors } from '../../../shared/constants/colors';
import type React from "react";
import { StyleSheet, View } from "react-native";

interface NotFoundCardProps {
  title: string;
  description: string;
  button: React.ReactNode;
  icon: React.ReactNode;
  iconPadding?: number;
}

function NotFoundCard({
  title,
  description,
  button,
  icon,
  iconPadding = 7,
}: NotFoundCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { padding: iconPadding }]}>
        {icon}
      </View>

      <View style={styles.textContainer}>
        <Text size="13" weight={"semibold"} textColor={"black"}>
          {title}
        </Text>
        <Text size="12" weight={"medium"} textColor={"dark"}>
          {description}
        </Text>
      </View>
      {button}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    width: "100%",
    alignItems: "center",
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  iconContainer: {
    borderRadius: "50%",
    backgroundColor: semanticColors.surface.background,
  },
});

export default NotFoundCard;
