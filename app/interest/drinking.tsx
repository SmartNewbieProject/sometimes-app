import { Text, PalePurpleGradient } from "@shared/ui";
import Layout from "@features/layout";
import { View, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Interest from '@features/interest';
import { useCallback } from "react";
import { Selector } from "@/src/widgets/selector";
import Loading from "@/src/features/loading";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;

const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

export default function DrinkingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { drinking, updateForm } = useInterestForm();

  const { data: preferences = {
    id: '',
    options: [],
  }, isLoading: optionsLoading } = usePreferenceOptionsQuery(Keys.DRINKING);

  const onChangeDrinking = (value: string) => {
    const target = preferences.options.find(o => o.id === value);
    updateForm('drinking', target);
  };

  useFocusEffect(useCallback(() => updateStep(InterestSteps.DRIKNING), []));

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-4">
        <Image
          source={require('@assets/images/drink.png')}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            음주는 만남에서 중요한 부분이죠
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            음주 선호도를 알려주세요!
          </Text>
        </View>

        <View className="flex-1 w-full items-center pt-2">
          <Loading.Lottie
            title="선호도를 불러오고 있어요"
            loading={optionsLoading}
          >
            <Selector
              value={drinking?.id}
              direction="vertical"
              options={preferences.options.map((option) => ({ label: option.displayName, value: option.id }))}
              onChange={onChangeDrinking}
              buttonProps={{
                className: 'min-w-[180px] w-full h-[52px]',
              }}
            />
          </Loading.Lottie>

        </View>

        <Layout.TwoButtons
          classNames="px-0"
          disabledNext={!drinking}
          onClickNext={() => router.navigate("/interest/interest")}
          onClickPrevious={() => router.navigate("/interest/age")}
        />
      </View>
    </Layout.Default>
  );
}
