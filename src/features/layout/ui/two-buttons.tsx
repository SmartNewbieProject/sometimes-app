import { cn, platform } from "@/src/shared/libs";
import { Button } from "@shared/ui";
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type Props = {
  onClickPrevious: () => void;
  onClickNext: () => void;
  content?: {
    prev?: string;
    next?: string;
  };
  disabledNext: boolean;
  style?: StyleProp<ViewStyle>;
};

export const TwoButtons = ({
  onClickNext,
  onClickPrevious,
  content,
  style,
  disabledNext,
}: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Button
        variant="secondary"
        className="flex-[0.3]"
        styles={styles.rightButton}
        onPress={onClickPrevious}
      >
        <Text style={styles.rightButtonText}> {content?.prev || "뒤로"}</Text>
      </Button>
      <Button
        className="flex-[0.7]"
        onPress={onClickNext}
        styles={styles.leftButton}
        disabled={disabledNext}
      >
        <Text style={styles.leftButtonText}>{content?.next || "다음으로"}</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 31,
    gap: 14,
    ...Platform.select({
      web: {
        marginBottom: 14, // md:mb-[72px] 은 무시
      },
      ios: {
        marginBottom: 58,
      },
      android: {
        marginBottom: 58,
      },
    }),
  },
  rightButton: {
    borderRadius: 20,
    backgroundColor: "#E2D9FF",
  },
  rightButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  leftButton: {
    borderRadius: 20,
  },
  leftButtonText: {
    fontSize: 20,
  },
});
