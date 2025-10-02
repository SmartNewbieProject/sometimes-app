import colors from "@/src/shared/constants/colors";
import { Text } from "@/src/shared/ui";
import { useEffect, useState } from "react";
import {
  ScrollView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Selector } from "../selector";
import i18n from "@/src/shared/libs/i18n";

type Props = {
  onChange: (mbti: string) => void;
  onBlur: () => void;
  value?: string | null;
  justifyContent?: "center" | "flex-start" | "flex-end";
};

const parse = (mbti: string, index: number) => mbti.charAt(index);
export function MbtiSelector({
  onChange,
  onBlur,
  value,
  justifyContent = "center",
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { justifyContent: justifyContent },
      ]}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View style={[styles.mbtiColumn, styles.marginRight]}>
        <Text style={styles.label}>{i18n.t('widgets.mbti-selector.mbti_selector.extroversion')}</Text>
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
        <Text style={styles.bottomLabel}>{i18n.t('widgets.mbti-selector.mbti_selector.introversion')}</Text>
      </View>
      <View style={[styles.mbtiColumn, styles.marginRight]}>
        <Text style={styles.label}>{i18n.t('widgets.mbti-selector.mbti_selector.intuition')}</Text>
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
        <Text style={styles.bottomLabel}>{i18n.t('widgets.mbti-selector.mbti_selector.sensing')}</Text>
      </View>
      <View style={[styles.mbtiColumn, styles.marginRight]}>
        <Text style={styles.label}>{i18n.t('widgets.mbti-selector.mbti_selector.feeling')}</Text>
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
        <Text style={styles.bottomLabel}>{i18n.t('widgets.mbti-selector.mbti_selector.thinking')}</Text>
      </View>
      <View style={styles.mbtiColumn}>
        <Text style={styles.label}>{i18n.t('widgets.mbti-selector.mbti_selector.prospecting')}</Text>
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
        <Text style={styles.bottomLabel}>{i18n.t('widgets.mbti-selector.mbti_selector.judging')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    rowGap: 16,
    columnGap: 16,
  },
  scrollContent: {
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
  label: {
    fontSize: 14,
    color: "#8B5CF6",
    marginBottom: 8,
  },
  bottomLabel: {
    fontSize: 14,
    color: "#8B5CF6",
    marginTop: 16,
  },
  selector: {
    width: 96,
    height: 96,
  },
});
