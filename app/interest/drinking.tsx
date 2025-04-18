import { Text, PalePurpleGradient, StepSlider } from "@shared/ui";
import Layout from "@features/layout";
import { View, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Interest from '@features/interest';
import { useCallback, useEffect, useState } from "react";
import { Selector } from "@/src/widgets/selector";

const { ui, hooks, services } = Interest;
const { useInterestStep } = hooks;
const { InterestSteps } = services;


export default function DrinkingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const [drinkingPreference, setDrinkingPreference] = useState(2);

  // Log when drinking preference changes
  useEffect(() => {
    console.log('Drinking preference changed:', drinkingPreference);
  }, [drinkingPreference]);

  useFocusEffect(useCallback(() => updateStep(InterestSteps.DRIKNING), []));

  // Format the drinking preference value for display
  const formatDrinkingValue = (value: number) => {
    const labels = [
      '전혀 마시지 않음',
      '거의 마시지 않음',
      '가끔 마심',
      '자주 마심',
      '매우 자주 마심'
    ];
    return labels[value];
  };

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

        <View className="flex-1 w-full items-center pt-8">
          <Selector
            value={""}
            direction="vertical"
            options={[
              { label: '남성', value: 'male' },
              { label: '여성', value: 'female' },
            ]}
            onChange={(value) => {

            }}
            buttonProps={{
              className: 'w-[180px] h-[52px]',
            }}
          />
        </View>

        <Layout.TwoButtons
          classNames="px-0"
          disabledNext={false}
          onClickNext={() => router.navigate("/interest/drinking")}
          onClickPrevious={() => router.navigate("/interest/age")}
        />
      </View>
    </Layout.Default>
  );
}
