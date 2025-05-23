import { useCallback, useEffect, useState } from 'react';
import Layout from "@/src/features/layout";
import { PalePurpleGradient } from "@/src/shared/ui";
import { Text } from '@shared/ui';
import { Image, View } from "react-native";
import Interest from '@features/interest';
import { router, useFocusEffect } from 'expo-router';
import { PreferenceKeys } from '@/src/features/interest/queries';
import { usePreferenceOptionsQuery } from '@/src/features/interest/queries';
import Loading from '@/src/features/loading';
import type { AgeOptionData } from '@/src/features/interest/types';

const { ui, hooks, services } = Interest;
const { AgeSelector } = ui;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;

export default function AgeSelectionScreen() {
  const { age, updateForm } = useInterestForm();
  const { updateStep } = useInterestStep();
  const [options, setOptions] = useState<AgeOptionData[]>([]);
  const { data: preferences = {
    typeId: '',
    options: [],
  }, isLoading: optionsLoading } = usePreferenceOptionsQuery(PreferenceKeys.AGE);

  useEffect(() => {
    if (preferences.typeId === '') {
      return;
    }

    const loaded = preferences.options.map((option) => ({
      value: option.id,
      label: option.displayName,
      image: (() => {
        switch (option.displayName) {
          case '동갑':
            return require('@assets/images/age/same.png');
          case '연하':
            return require('@assets/images/age/under.png');
          case '연상':
            return require('@assets/images/age/high.png');
          default:
            return require('@assets/images/age/nothing.png');
        }
      })(),
    })) as AgeOptionData[];

    setOptions(loaded);
  }, [preferences]);
  

  useFocusEffect(useCallback(() => updateStep(InterestSteps.AGE), []));

  if (optionsLoading) {
    return <Loading.Page title="나이대 선호도를 불러오고 있어요" />;
  }

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
            options={options}
            value={age}
            onChange={age => updateForm('age', age)}
            size="md"
            className="mb-8"
          />
        </View>

        <Layout.TwoButtons
          classNames="px-0"
          disabledNext={!age}
          onClickNext={() => router.navigate("/interest/drinking")}
          onClickPrevious={() => router.navigate("/interest")}
        />
      </View>
    </Layout.Default>
  );
}
