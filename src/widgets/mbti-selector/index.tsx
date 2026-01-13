import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Text } from "@/src/shared/ui";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Selector } from "../selector";
import i18n from "@/src/shared/libs/i18n";

type Props = {
  onChange: (mbti: string) => void;
  onBlur: () => void;
  value?: string | null;
  justifyContent?: "center" | "flex-start" | "flex-end";
  layout?: "vertical" | "horizontal";
};

const parse = (mbti: string, index: number) => mbti && mbti.length > index ? mbti.charAt(index) : "";

export function MbtiSelector({
  onChange,
  onBlur,
  value,
  justifyContent = "flex-start",
  layout = "vertical",
}: Props) {
  const [_value, setValue] = useState<string>(value ?? "");

  const [first, setFirst] = useState<string>(parse(_value, 0));
  const [second, setSecond] = useState<string>(parse(_value, 1));
  const [third, setThird] = useState<string>(parse(_value, 2));
  const [fourth, setFourth] = useState<string>(parse(_value, 3));

  const mbti = `${first}${second}${third}${fourth}`;

  useEffect(() => {
    if (mbti.length <= 3) return;
    onChange(mbti);
    setValue(mbti);
  }, [mbti, _value]);

  const renderMbtiRow = (
    leftValue: string,
    rightValue: string,
    selectedValue: string,
    onSelect: (value: string) => void,
    leftLabel: string,
    rightLabel: string
  ) => {
    return (
      <View style={styles.mbtiRow}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.circleButton,
              selectedValue === leftValue && styles.circleButtonSelected,
            ]}
            onPress={() => {
              onSelect(leftValue);
              onBlur();
            }}
          >
            <Text
              style={[
                styles.buttonText,
                selectedValue === leftValue && styles.buttonTextSelected,
              ]}
            >
              {leftValue}
            </Text>
          </Pressable>
          <Text style={styles.label}>{leftLabel}</Text>
        </View>

        <View style={styles.lineContainer}>
          <View style={styles.line} />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.circleButton,
              selectedValue === rightValue && styles.circleButtonSelected,
            ]}
            onPress={() => {
              onSelect(rightValue);
              onBlur();
            }}
          >
            <Text
              style={[
                styles.buttonText,
                selectedValue === rightValue && styles.buttonTextSelected,
              ]}
            >
              {rightValue}
            </Text>
          </Pressable>
          <Text style={styles.label}>{rightLabel}</Text>
        </View>
      </View>
    );
  };

  if (layout === "horizontal") {
    return (
      <ScrollView
        style={styles.containerHorizontal}
        contentContainerStyle={[
          styles.scrollContentHorizontal,
          { justifyContent: justifyContent },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={[styles.mbtiColumn, styles.marginRight]}>
          <Text style={styles.labelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.extroversion')}</Text>
          <Selector
            value={first}
            direction="vertical"
            options={[
              { label: "E", value: "E" },
              { label: "I", value: "I" },
            ]}
            onChange={(value) => setFirst(value as string)}
            onBlur={onBlur}
            variant="default"
          />
          <Text style={styles.bottomLabelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.introversion')}</Text>
        </View>
        <View style={[styles.mbtiColumn, styles.marginRight]}>
          <Text style={styles.labelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.intuition')}</Text>
          <Selector
            value={second}
            direction="vertical"
            options={[
              { label: "N", value: "N" },
              { label: "S", value: "S" },
            ]}
            onChange={(value) => setSecond(value as string)}
            onBlur={onBlur}
            variant="default"
          />
          <Text style={styles.bottomLabelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.sensing')}</Text>
        </View>
        <View style={[styles.mbtiColumn, styles.marginRight]}>
          <Text style={styles.labelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.feeling')}</Text>
          <Selector
            value={third}
            direction="vertical"
            options={[
              { label: "F", value: "F" },
              { label: "T", value: "T" },
            ]}
            onChange={(value) => setThird(value as string)}
            onBlur={onBlur}
            variant="default"
          />
          <Text style={styles.bottomLabelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.thinking')}</Text>
        </View>
        <View style={styles.mbtiColumn}>
          <Text style={styles.labelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.prospecting')}</Text>
          <Selector
            value={fourth}
            direction="vertical"
            options={[
              { label: "P", value: "P" },
              { label: "J", value: "J" },
            ]}
            onChange={(value) => setFourth(value as string)}
            onBlur={onBlur}
            variant="default"
          />
          <Text style={styles.bottomLabelHorizontal}>{i18n.t('widgets.mbti-selector.mbti_selector.judging')}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { justifyContent: justifyContent },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {renderMbtiRow(
        "E",
        "I",
        first,
        setFirst,
        i18n.t('widgets.mbti-selector.mbti_selector.extroversion'),
        i18n.t('widgets.mbti-selector.mbti_selector.introversion')
      )}
      {renderMbtiRow(
        "N",
        "S",
        second,
        setSecond,
        i18n.t('widgets.mbti-selector.mbti_selector.intuition'),
        i18n.t('widgets.mbti-selector.mbti_selector.sensing')
      )}
      {renderMbtiRow(
        "T",
        "F",
        third,
        setThird,
        i18n.t('widgets.mbti-selector.mbti_selector.thinking'),
        i18n.t('widgets.mbti-selector.mbti_selector.feeling')
      )}
      {renderMbtiRow(
        "J",
        "P",
        fourth,
        setFourth,
        i18n.t('widgets.mbti-selector.mbti_selector.judging'),
        i18n.t('widgets.mbti-selector.mbti_selector.prospecting')
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 32,
    gap: 24,
    paddingVertical: 16,
  },
  mbtiRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonContainer: {
    alignItems: "center",
    gap: 8,
    minWidth: 60,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 24,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 2,
    borderColor: semanticColors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonSelected: {
    backgroundColor: semanticColors.brand.primary,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: 'Pretendard-Medium',
    color: semanticColors.brand.primary,
  },
  buttonTextSelected: {
    color: semanticColors.surface.background,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: semanticColors.brand.primary,
    textAlign: "center",
    maxWidth: 60,
  },
  lineContainer: {
    width: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: semanticColors.border.smooth,
  },
  // Horizontal layout styles
  containerHorizontal: {
    width: "100%",
    flexDirection: "row",
  },
  scrollContentHorizontal: {
    flexDirection: "row",
    width: "100%",
    columnGap: 24,
    alignItems: "flex-start",
  },
  mbtiColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  marginRight: {
    marginRight: 0,
  },
  labelHorizontal: {
    fontSize: 14,
    color: semanticColors.brand.primary,
    marginBottom: 8,
  },
  bottomLabelHorizontal: {
    fontSize: 14,
    color: semanticColors.brand.primary,
    marginTop: 16,
  },
});
