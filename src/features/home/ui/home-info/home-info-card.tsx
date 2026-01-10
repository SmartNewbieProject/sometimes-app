import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from "react-native";

interface ImagePosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
}

interface HomeInfoCardProps {
  buttonMessage: string;
  title: string;
  characterImageUri: number;
  heartImageUri: number;
  description: string;
  isCompleted?: boolean;
  onClick: () => void;
  characterPosition?: ImagePosition;
  heartPosition?: ImagePosition;
}

function HomeInfoCard({
  buttonMessage,
  title,
  isCompleted = false,
  onClick,
  description,
  characterImageUri,
  heartImageUri,
  characterPosition,
  heartPosition,
}: HomeInfoCardProps) {
  const characterStyle: ViewStyle = {
    position: "absolute",
    width: characterPosition?.width ?? 140,
    height: characterPosition?.height ?? 102,
    left: characterPosition?.left,
    top: characterPosition?.top,
    right: characterPosition?.right,
    bottom: characterPosition?.bottom,
  };

  const heartStyle: ViewStyle = {
    position: "absolute",
    width: heartPosition?.width ?? 50,
    height: heartPosition?.height ?? 50,
    left: heartPosition?.left,
    top: heartPosition?.top ?? 35,
    right: heartPosition?.right ?? -5,
    bottom: heartPosition?.bottom,
  };

  return (
    <TouchableOpacity
      disabled={isCompleted}
      onPress={onClick}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View style={styles.imageSection}>
        <View style={styles.circleWrapper}>
          <View style={styles.circle} />
          <Image
            source={characterImageUri}
            style={characterStyle}
            contentFit="contain"
          />
          <Image
            source={heartImageUri}
            style={heartStyle}
            contentFit="contain"
          />
        </View>
      </View>
      <Text size="lg" weight="semibold" textColor="black" style={styles.title}>
        {title}
      </Text>
      <Text size="xs" weight="light" style={styles.description}>
        {description}
      </Text>
      <View
        style={[
          styles.button,
          isCompleted ? styles.buttonCompleted : styles.buttonIncomplete,
        ]}
      >
        <Text
          size="sm"
          weight="semibold"
          style={
            isCompleted
              ? styles.buttonTextCompleted
              : styles.buttonTextIncomplete
          }
        >
          {buttonMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 199,
    borderRadius: 20,
    backgroundColor: "#F8F4FF",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 13,
    paddingHorizontal: 8,
  },
  imageSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  circleWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: semanticColors.brand.primary,
  },
  title: {
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    textAlign: "center",
    marginBottom: 12,
    color: "#717171",
  },
  button: {
    borderRadius: 20,
    width: 90,
    height: 31,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonCompleted: {
    backgroundColor: semanticColors.brand.primary,
  },
  buttonIncomplete: {
    backgroundColor: "rgba(122, 74, 226, 0.25)",
  },
  buttonTextCompleted: {
    color: "white",
  },
  buttonTextIncomplete: {
    color: semanticColors.brand.primary,
  },
});

export default HomeInfoCard;
