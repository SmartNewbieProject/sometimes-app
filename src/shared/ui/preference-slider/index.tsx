import type { Preferences, PreferenceOption } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import { StepSlider } from "@/src/shared/ui";
import Tooltip from "@/src/shared/ui/tooltip";
import { useEffect } from "react";
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
  showMiddle?: boolean;
  lastLabelLeft?: number;
  firstLabelLeft?: number;
  middleLabelLeft?: number;
  tooltips?: TooltipData[];
  showTooltip?: boolean;
  autoSetInitialValue?: boolean;
  onSliderTouchStart?: () => void;
  onSliderTouchEnd?: () => void;
  mapOption?: (option: PreferenceOption) => { label: string; value: string };
}

export function PreferenceSlider({
  preferences,
  value,
  onChange,
  isLoading = false,
  loadingTitle,
  showMiddle = true,
  lastLabelLeft,
  firstLabelLeft,
  middleLabelLeft,
  tooltips,
  showTooltip = false,
  autoSetInitialValue = true,
  onSliderTouchStart,
  onSliderTouchEnd,
  mapOption,
}: PreferenceSliderProps) {
  const defaultMapOption = (option: PreferenceOption) => ({
    label: option.displayName,
    value: option.id,
  });

  const options =
    preferences?.options?.map(mapOption || defaultMapOption) ?? [];

  const index = preferences?.options.findIndex(
    (item) => item.id === value?.id
  );
  const currentIndex = index !== undefined && index !== -1 ? index : 0;

  useEffect(() => {
    if (isLoading || !autoSetInitialValue) return;
    if (!value && preferences.options[currentIndex]) {
      onChange(preferences.options[currentIndex]);
    }
  }, [isLoading, preferences.options, currentIndex, value, onChange, autoSetInitialValue]);

  const handleChange = (sliderValue: number) => {
    if (preferences?.options && preferences.options.length > sliderValue) {
      onChange(preferences.options[sliderValue]);
    }
  };

  return (
    <>
      <View style={styles.wrapper}>
        <Loading.Lottie title={loadingTitle} loading={isLoading}>
          <StepSlider
            min={0}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            showMiddle={showMiddle}
            key={`slider-${currentIndex || "none"}`}
            defaultValue={currentIndex}
            value={currentIndex}
            onChange={handleChange}
            lastLabelLeft={lastLabelLeft}
            firstLabelLeft={firstLabelLeft}
            middleLabelLeft={middleLabelLeft}
            onTouchStart={onSliderTouchStart}
            onTouchEnd={onSliderTouchEnd}
            options={options}
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
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  tooltipContainer: {
    marginTop: 24,
  },
});
