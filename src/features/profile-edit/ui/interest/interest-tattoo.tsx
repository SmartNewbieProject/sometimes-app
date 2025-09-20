import Interest from "@/src/features/interest";
import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import colors from "@/src/shared/constants/colors";
import { StepSlider } from "@/src/shared/ui";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

  const { t } = useTranslation();
  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeName === Keys.TATTOO) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === tattoo?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!tattoo && preferences.options[currentIndex]) {
      updateForm("tattoo", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, tattoo]);
  const onChangeTattoo = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("tattoo", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("features.profile-edit.ui.interest.tattoo.title")}</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie
          title={t("features.profile-edit.ui.interest.tattoo.loading")}
          loading={optionsLoading}
        >
          <StepSlider
            min={0}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            showMiddle={true}
            key={`tattoo-${currentIndex || "none"}`}
            defaultValue={currentIndex}
            value={currentIndex}
            middleLabelLeft={-10}
            onChange={onChangeTattoo}
            options={
              preferences?.options
                .map((option) =>
                  option.displayName === t("features.profile-edit.ui.interest.tattoo.no_tattoo")
                    ? { ...option, displayName: t("features.profile-edit.ui.interest.tattoo.small_tattoo") }
                    : option
                )
                .map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) || []
            }
          />
        </Loading.Lottie>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 22,
  },
  container: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
});

export default InterestTattoo;
