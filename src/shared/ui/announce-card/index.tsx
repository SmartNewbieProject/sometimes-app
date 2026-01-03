import { TouchableOpacity, StyleSheet } from "react-native";
import { ImageResources } from "../../libs";
import { ImageResource } from "../image-resource";
import { Text } from "../text";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

type AnnounceCardProps = {
  emoji?: ImageResources;
  emojiSize?: {
    width: number;
    height: number;
  };
  textSize?:
    | "10"
    | "13"
    | "sm"
    | "md"
    | "18"
    | "20"
    | "12"
    | "chip"
    | "lg";
  text: string;
  onPress: () => void;
  theme?: "default" | "alert";
};

export const AnnounceCard = ({
  emoji,
  emojiSize,
  text,
  textSize = "13",
  onPress,
  theme = "default",
}: AnnounceCardProps) => {
  const cardStyle = theme === "alert" ? styles.cardAlert : styles.cardDefault;
  const textColor = theme === "alert" ? "#FF813C" : semanticColors.brand.deep;

  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      activeOpacity={0.4}
      onPress={onPress}
    >
      {theme === "alert" && (
        <ImageResource
          resource={ImageResources.ANNOUNCEMENT_ALERT}
          width={emojiSize?.width || 24}
          height={emojiSize?.height || 24}
        />
      )}
      {emoji && (
        <ImageResource
          resource={emoji}
          width={emojiSize?.width || 24}
          height={emojiSize?.height || 24}
        />
      )}
      <Text size={textSize || "13"} weight="bold" style={{ color: textColor }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cardDefault: {
    backgroundColor: "#F5F0FF",
  },
  cardAlert: {
    backgroundColor: semanticColors.surface.background,
  },
});
