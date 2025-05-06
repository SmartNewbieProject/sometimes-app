import Layout from "@/src/features/layout";
import { PalePurpleGradient, Text, Divider } from "@/src/shared/ui";
import Interest from "@features/interest";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View, Image } from "react-native";
import Loading from "@/src/features/loading";
import { ImageResources } from "@/src/shared/libs";
import { useAuth } from "@/src/features/auth";
import { Selector } from "@/src/widgets/selector";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function MilitarySelectionScreen() {
  const { datingStyleIds, updateForm, militaryPreference, militaryStatus } = useInterestForm();
  const { my } = useAuth();
  const messages: string[] = (() => {
    if (!my) return ['', ''];
    if (my.gender === 'FEMALE') {
      return [
        '군필에 대해',
        '어떻게 생각하시나요?',
      ];
    }
    return [
      '회원님의 군필 여부를',
      '알려주세요!'
    ];
  })();

  const status = (() => {
    if (!my) return undefined;
    return my.gender === 'FEMALE' ? militaryPreference : militaryStatus;
  })();

  const type = (() => {
    if (!my) return undefined;
    return my.gender === 'FEMALE' ? PreferenceKeys.MILITARY_PREFERENCE : PreferenceKeys.MILITARY_STATUS;
  })();

  const { data: preferences, isLoading: optionsLoading } = usePreferenceOptionsQuery(type);

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    updateForm("datingStyleIds", values);
  };

  const disabled = datingStyleIds.length < 1;

  useFocusEffect(useCallback(() => useInterestStep.getState().updateStep(InterestSteps.MILITARY), []));

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-4 mb-4">
        <Image
          source={{ uri: ImageResources.MILITARY }}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            {messages[0]}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {messages[1]}
          </Text>
        </View>

        <Divider.Horizontal className="mb-1.5" />

        <View className="flex-1 w-full items-center pt-2">
          <Loading.Lottie
            title="옵션을 불러오고 있어요"
            loading={optionsLoading}
          >
            <Selector
              value={status?.id}
              direction="vertical"
              options={preferences?.options.map((option) => ({ label: option.displayName, value: option.id })) ?? []}
              onChange={value => {
                const target = preferences?.options.find(o => o.id === value);
                updateForm(my?.gender === 'FEMALE' ? 'militaryPreference' : 'militaryStatus', target);
              }}
              buttonProps={{
                className: 'min-w-[180px] w-full h-[52px]',
              }}
            />
          </Loading.Lottie>
        </View>
      </View>

      <Layout.TwoButtons
        disabledNext={disabled}
        onClickNext={() => router.navigate('/interest/smoking')}
        onClickPrevious={() => router.navigate("/interest/dating-style")}
      />
    </Layout.Default>
  )
}
