import type { Preferences, PreferenceOption } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import { ChipSelector } from "@/src/widgets/chip-selector";
import Tooltip from "@/src/shared/ui/tooltip";
import { useEffect, useMemo, useCallback } from "react";
import { StyleSheet, View } from "react-native";

interface TooltipData {
  title: string;
  description: string[];
}

interface PreferenceSliderProps {
  preferences: Preferences;
  value?: PreferenceOption;
  onChange: (option: PreferenceOption) => void;
  isLoading?: boolean;
  loadingTitle?: string;
  tooltips?: TooltipData[];
  showTooltip?: boolean;
  autoSetInitialValue?: boolean;
  defaultIndex?: number;
}

export function PreferenceSlider({
  preferences,
  value,
  onChange,
  isLoading = false,
  loadingTitle,
  tooltips,
  showTooltip = false,
  autoSetInitialValue = true,
  defaultIndex = 0,
}: PreferenceSliderProps) {
  const options = useMemo(
    () =>
      preferences?.options?.map((option) => ({
        label: option.displayName,
        value: option.id,
      })) ?? [],
    [preferences?.options],
  );

  const index = preferences?.options.findIndex(
    (item) => item.id === value?.id
  ) ?? -1;
  const currentIndex = index !== -1 ? index : defaultIndex;

  useEffect(() => {
    if (isLoading || !autoSetInitialValue) return;
    if (!value && preferences.options[currentIndex]) {
      onChange(preferences.options[currentIndex]);
    }
  }, [isLoading, preferences.options, currentIndex, value, onChange, autoSetInitialValue]);

  const handleChange = useCallback(
    (id: string) => {
      const opt = preferences?.options.find((o) => o.id === id);
      if (opt) onChange(opt);
    },
    [preferences?.options, onChange],
  );

  return (
    <>
      <View style={styles.wrapper}>
        <Loading.Lottie title={loadingTitle} loading={isLoading}>
          <ChipSelector
            options={options}
            value={value?.id}
            onChange={handleChange}
            align="center"
          />
        </Loading.Lottie>
      </View>
      {showTooltip && tooltips && tooltips[currentIndex] && (
        <View style={styles.tooltipContainer}>
          <Tooltip
            title={tooltips[currentIndex].title}
            description={tooltips[currentIndex].description}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
  },
  tooltipContainer: {
    marginTop: 24,
  },
});
