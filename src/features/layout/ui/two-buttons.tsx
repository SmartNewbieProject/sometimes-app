import { platform } from "@/src/shared/libs";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Button } from "@shared/ui";
import { useTranslation } from "react-i18next";
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onClickPrevious?: () => void;
  onClickNext: () => void;
  content?: {
    prev?: string;
    next?: string;
  };
  disabledNext: boolean;
  style?: StyleProp<ViewStyle>;
  hidePrevious?: boolean;
};

export const TwoButtons = ({
  onClickNext,
  onClickPrevious,
  content,
  style,
  disabledNext,
  hidePrevious = false,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      style={[styles.container, style, { paddingBottom: insets.bottom + 16 }]}
    >
      {!hidePrevious && (
        <Button
          variant="secondary"
          styles={[styles.rightButton, { flex: 0.3 }]}
          onPress={onClickPrevious!}
        >
          <Text style={styles.rightButtonText}> {content?.prev || t("global.back")}</Text>
        </Button>
      )}
      <Button
        onPress={onClickNext}
        styles={[styles.leftButton, { flex: hidePrevious ? 1 : 0.7 }]}
        disabled={disabledNext}
      >
        <Text style={styles.leftButtonText}>{content?.next || t("global.next")}</Text>
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
  },
  rightButton: {
    borderRadius: 20,
  },
  rightButtonText: {
    color: semanticColors.text.primary,
    fontSize: 20,
  },
  leftButton: {
    borderRadius: 20,
  },
  leftButtonText: {
    fontSize: 20,
    color: semanticColors.text.inverse,
  },
});
