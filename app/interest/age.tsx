import { useCallback, useState } from 'react';
import Layout from "@/src/features/layout";
import { PalePurpleGradient } from "@/src/shared/ui";
import { Text } from '@shared/ui';
import { Image, View } from "react-native";
import Interest from '@features/interest';
import { router, useFocusEffect } from 'expo-router';
import { AgeOption } from '@/src/features/interest/ui';

const { ui, hooks, services } = Interest;
const { AgeSelector } = ui;
const { useInterestStep } = hooks;
const { InterestSteps } = services;

export default function AgeSelectionScreen() {
  const [selectedAge, setSelectedAge] = useState<AgeOption | undefined>();
  const { updateStep } = useInterestStep();

  const handleNext = () => {
    if (selectedAge) {
      router.back();
    }
  };

  useFocusEffect(useCallback(() => updateStep(InterestSteps.AGE), []));

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-4">
        <Image
          source={require('@assets/images/peoples.png')}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            선호하는 나이대를
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            선택해 주세요!
          </Text>
        </View>

        <View className="flex-1 w-full flex items-center">
          <AgeSelector
            value={selectedAge}
            onChange={setSelectedAge}
            size="md"
            className="mb-8"
          />
        </View>

        <Layout.TwoButtons
          classNames="px-0"
          disabledNext={!selectedAge}
          onClickNext={() => router.navigate("/interest/drinking")}
          onClickPrevious={() => router.navigate("/interest")}
        />
      </View>
    </Layout.Default>
  );
}
