import Layout from "@/src/features/layout";
import { PalePurpleGradient, Text, Divider } from "@/src/shared/ui";
import Interest from "@features/interest";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View, Image } from "react-native";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import Loading from "@/src/features/loading";
import { ImageResources } from "@/src/shared/libs";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function DatingStyleSelectionScreen() {
  const { datingStyleIds, updateForm } = useInterestForm();
  const { data: preferences, isLoading } = usePreferenceOptionsQuery(PreferenceKeys.DATING_STYLE);

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    updateForm("datingStyleIds", values);
  };

  const nextMessage = (() => {
    if (datingStyleIds.length < 1) {
      return `${1 - datingStyleIds.length} 개만 더 선택해주세요`;
    }
    return '다음으로';
  })();

  const disabled = datingStyleIds.length < 1;

  useFocusEffect(useCallback(() => useInterestStep.getState().updateStep(InterestSteps.DATING_STYLE), []));

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-4 mb-4">
        <Image
          source={{ uri: ImageResources.DATING_STYLE }}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            당신에게 가장 잘 맞는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            연애 스타일은 무엇인가요?
          </Text>
        </View>

        <View className="w-full flex flex-col gap-y-2">
          <StepIndicator
            length={3}
            step={datingStyleIds.length}
            dotGap={4}
            dotSize={16}
            className="self-end"
          />
          <Divider.Horizontal />
        </View>

        <View className="flex-1 w-full flex px-4 mt-2">
          <Loading.Lottie
            title="관심사를 불러오고 있어요"
            loading={isLoading}
          >
            <ChipSelector
              value={datingStyleIds}
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
      </View>

      <Layout.TwoButtons
        disabledNext={disabled}
        content={{
          next: nextMessage,
        }}
        onClickNext={() => router.navigate('/interest/military')}
        onClickPrevious={() => router.navigate("/interest/interest")}
      />
    </Layout.Default>
  )
}
