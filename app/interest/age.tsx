import { useState } from 'react';
import Layout from "@/src/features/layout";
import { Button, PalePurpleGradient } from "@/src/shared/ui";
import { Image, View } from "react-native";
import { Text } from '@shared/ui';
import Interest from '@features/interest';
import { router } from 'expo-router';
import { AgeOption } from '@/src/features/interest/ui';

const { ui } = Interest;
const { AgeSelector } = ui;

export default function AgeSelectionScreen() {
  const [selectedAge, setSelectedAge] = useState<AgeOption | undefined>();

  const handleNext = () => {
    if (selectedAge) {
      router.back(); // For now, just go back since we don't have a next screen
    }
  };

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-10">
        <Image
          source={require('@assets/images/peoples.png')}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-8">
          <Text weight="semibold" size="20" textColor="black">
            선호하는 나이대를
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            선택해 주세요!
          </Text>
        </View>

        <View className="flex-1 items-center">
          <AgeSelector
            value={selectedAge}
            onChange={setSelectedAge}
            size="md"
            className="mb-8"
          />
        </View>

        <View className="pb-10">
          <Button
            variant="primary"
            onPress={handleNext}
            disabled={!selectedAge}
            className="w-full py-4"
          >
            다음
          </Button>
        </View>
      </View>
    </Layout.Default>
  );
}
