import Layout from "@/src/features/layout";
import { Divider, PalePurpleGradient, Text } from "@shared/ui";
import Interest from "@features/interest";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View, Image } from "react-native";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import Loading from "@/src/features/loading";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function InterestSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { interestIds, updateForm } = useInterestForm();
  const { data: preferences, isLoading } = usePreferenceOptionsQuery(PreferenceKeys.INTEREST);

  const onChangeOption = (values: string[]) => {
    if (values.length > 5) {
      return;
    }
    updateForm("interestIds", values);
  };

  const disabled = interestIds.length < 3;

  const nextMessage = (() => {
    if (interestIds.length < 3) {
      return `${3 - interestIds.length} 개만 더 선택해주세요`;
    }
    return '다음으로';
  })();

  useFocusEffect(useCallback(() => updateStep(InterestSteps.INTEREST), []));

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="px-5 pt-4 mb-4">
        <Image
          source={require('@assets/images/loved.png')}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            최근에 관심이 가는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            활동이나 일이 있나요?
          </Text>
        </View>

        <View className="w-full flex flex-col gap-y-2">
          <StepIndicator
            length={5}
            step={interestIds.length}
            dotGap={4}
            dotSize={16}
            className="self-end"
          />
          <Divider.Horizontal />
        </View>
      </View>

      <View className="flex-1 w-full flex px-4">
        <Loading.Lottie
          title="관심사를 불러오고 있어요"
          loading={isLoading}
        >
          <ChipSelector
            value={interestIds}
            options={
              preferences?.
                options.map((option) => ({ label: option.displayName, value: option.id, imageUrl: option?.imageUrl })) || []
            }
            onChange={onChangeOption}
            multiple
            align="center"
            className="w-full"
          />
        </Loading.Lottie>
      </View>

      <Layout.TwoButtons
        disabledNext={disabled}
        content={{
          next: nextMessage,
        }}
        onClickNext={() => router.navigate('/interest/dating-style')}
        onClickPrevious={() => router.navigate("/interest/drinking")}
      />
    </Layout.Default>
  );
}
