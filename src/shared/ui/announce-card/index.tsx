import { TouchableOpacity, StyleSheet } from "react-native";
import { ImageResources } from "../../libs";
import { ImageResource } from "../image-resource";
import { Text } from "../text";
import { semanticColors } from "../../constants/colors";

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
    | "lg"
    | null
    | undefined;
  text: string;
  onPress: () => void;
  theme?: "default" | "alert";
  customTextStyle?: object; // 커스텀 텍스트 스타일
};

export const AnnounceCard = ({
  emoji,
  emojiSize,
  text,
  textSize = "13",
  onPress,
  theme = "default",
  customTextStyle,
}: AnnounceCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        theme === "default" ? styles.defaultTheme : styles.alertTheme,
      ]}
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
      <Text
        size={textSize}
        weight="bold"
        style={[
          theme === "default" ? styles.defaultText : styles.alertText,
          customTextStyle
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  defaultTheme: {
    backgroundColor: semanticColors.surface.secondary,
  },
  alertTheme: {
    backgroundColor: semanticColors.surface.background,
  },
  defaultText: {
    color: semanticColors.text.primary,
  },
  alertText: {
    color: '#FF813C',
  },
});
