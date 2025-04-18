import { Text, PalePurpleGradient, StepSlider } from "@shared/ui";
import Layout from "@features/layout";
import { View, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Interest from '@features/interest';
import { useCallback, useEffect, useState } from "react";
import { Selector } from "@/src/widgets/selector";
import Loading from "@/src/features/loading";
import { PreferenceOption } from "@/src/types/user";

const { ui, hooks, services, queries } = Interest;
const { useInterestStep } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;


export default function SmokingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const [preference, setPreference] = useState<PreferenceOption>();

  const { data: preferences = {
    id: '',
    options: [],
  }, isLoading: optionsLoading } = usePreferenceOptionsQuery(Keys.SMOKING);

  useFocusEffect(useCallback(() => updateStep(InterestSteps.SMOKING), []));

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-4">
        <Image
          source={require('@assets/images/loved.png')}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            담배에 대해
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            어떻게 생각하시나요?
          </Text>
        </View>

        <View className="flex-1 w-full items-center pt-2">
          <Loading.Lottie
            title="선호도를 불러오고 있어요"
            loading={optionsLoading}
          >
            <Selector
              value={preference?.id}
              direction="vertical"
              options={preferences.options.map((option) => ({ label: option.displayName, value: option.id }))}
              onChange={value => {
                const target = preferences.options.find(o => o.id === value);
                setPreference(target);
              }}
              buttonProps={{
                className: 'min-w-[180px] w-full h-[52px]',
              }}
            />
          </Loading.Lottie>

        </View>

        <Layout.TwoButtons
          classNames="px-0"
          disabledNext={!preference}
          onClickNext={() => router.navigate("/interest/tattoo")}
          onClickPrevious={() => router.navigate("/interest/interest")}
        />
      </View>
    </Layout.Default>
  );
}
