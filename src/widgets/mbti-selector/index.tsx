import { Text } from "@/src/shared/ui";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Selector } from "../selector";

type Props = {
  onChange: (mbti: string) => void;
  onBlur: () => void;
}

export function MbtiSelector({ onChange, onBlur }: Props) {
  const [first, setFirst] = useState<string>('');
  const [second, setSecond] = useState<string>('');
  const [third, setThird] = useState<string>('');
  const [fourth, setFourth] = useState<string>('');

  console.log({ onBlur });

  const mbti = `${first}${second}${third}${fourth}`;

  useEffect(() => {
    if (mbti.length <= 3) return;
    onChange(mbti);
  }, [mbti]);

  return (
    <View>
      <View className="flex flex-row justify-center gap-x-[30px]">
        <View className="flex flex-col justify-center items-center gap-x-1">
        <Text size="sm" textColor="purple" className="mb-2">
            외향
          </Text>
          <Selector
            value={first}
            direction="vertical"
            options={[
              { label: 'E', value: 'E' },
              { label: 'I', value: 'I' },
            ]}
            onChange={(value) => {
              setFirst(value as string);
            }}
            onBlur={onBlur}
            variant="circle"
          />
          <Text size="sm" textColor="purple" className="mt-[58px]">
            내향
          </Text>
        </View>
      <View className="flex flex-col justify-center items-center gap-x-1">
        <Text size="sm" textColor="purple" className="mb-2">
            직관
          </Text>
          <Selector
            value={second}
            direction="vertical"
            options={[
              { label: 'N', value: 'N' },
              { label: 'S', value: 'S' },
            ]}
            onChange={(value) => {
              setSecond(value as string);
            }}
            onBlur={onBlur}
            variant="circle"
          />
          <Text size="sm" textColor="purple" className="mt-[58px]">
            현실
          </Text>
        </View>

        <View className="flex flex-col justify-center items-center gap-x-1">
        <Text size="sm" textColor="purple" className="mb-2">
            감성
          </Text>
          <Selector
            value={third}
            direction="vertical"
            options={[
              { label: 'F', value: 'F' },
              { label: 'T', value: 'T' },
            ]}
            onChange={(value) => {
              setThird(value as string);
            }}
            onBlur={onBlur}
            variant="circle"
          />
          <Text size="sm" textColor="purple" className="mt-[58px]">
            이성
          </Text>
        </View>

        <View className="flex flex-col justify-center items-center gap-x-1">
        <Text size="sm" textColor="purple" className="mb-2">
            탐색
          </Text>
          <Selector
            value={fourth}
            direction="vertical"
            options={[
              { label: 'P', value: 'P' },
              { label: 'J', value: 'J' },
            ]}
            onChange={(value) => {
              setFourth(value as string);
            }}
            onBlur={onBlur}
            variant="circle"
          />
          <Text size="sm" textColor="purple" className="mt-[58px]">
            계획
          </Text>
        </View>

      </View>
    </View>
  );
}
