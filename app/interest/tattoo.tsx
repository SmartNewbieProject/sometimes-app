import { Text, PalePurpleGradient } from "@shared/ui";
import Layout from "@features/layout";
import { View, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Interest from '@features/interest';
import { useCallback, useState } from "react";
import { Selector } from "@/src/widgets/selector";
import Loading from "@/src/features/loading";
import { tryCatch } from "@/src/shared/libs";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Properties, savePreferences } from "@/src/features/interest/services";
import { queryClient } from "@/src/shared/config/query";

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;


export default function TattooSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { updateForm, clear: _, ...form } = useInterestForm();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const { data: preferences = {
    id: '',
    options: [],
  }, isLoading: optionsLoading } = usePreferenceOptionsQuery(Keys.TATTOO);
  const { showErrorModal } = useModal();

  const onFinish = async () => {
    setFormSubmitLoading(true);
    await tryCatch(async () => {
      const validation = Object.values(form).every(v => v !== null);
      if (!validation) throw new Error("비어있는 양식이 존재합니다.");
      await savePreferences({
        age: form.age as string,
        drinking: form.drinking?.id as string,
        interestIds: form.interestIds as string[],
        smoking: form.smoking?.id as string,
        tattoo: form.tattoo?.id as string,
      });
      await queryClient.invalidateQueries({
        queryKey: ['check-preference-fill'],
      });
      router.navigate("/interest/done");
      setFormSubmitLoading(false);
    }, ({ error }) => {
      showErrorModal(error, 'error');
      setFormSubmitLoading(false);
    });
  };

  useFocusEffect(useCallback(() => updateStep(InterestSteps.TATTOO), []));

  if (formSubmitLoading) {
    return <Loading.Page />;
  }

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
            문신에 대해
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
              value={form.tattoo?.id}
              direction="vertical"
              options={preferences.options.map((option) => ({ label: option.displayName, value: option.id }))}
              onChange={value => {
                const target = preferences.options.find(o => o.id === value);
                updateForm('tattoo', target);
              }}
              buttonProps={{
                className: 'min-w-[180px] w-full h-[52px]',
              }}
            />
          </Loading.Lottie>

        </View>

        <Layout.TwoButtons
          classNames="px-0"
          disabledNext={!form.tattoo}
          onClickNext={onFinish}
          onClickPrevious={() => router.navigate("/interest/smoking")}
        />
      </View>
    </Layout.Default>
  );
}
