import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Divider, Button, Check } from '@/src/shared/ui';
import { CheckboxLabel } from '@/src/widgets';
import { router } from 'expo-router';
import { useState } from 'react';
import { debounce } from '@shared/libs/debounce';

export default function TermsScreen() {
  const [agreements, setAgreements] = useState<Agreement[]>(AGREEMENTS);

  const allAgreement = agreements.every(agreement => agreement.checked);

  const isNext = agreements
    .filter(agreement => agreement.required)
    .every(agreement => agreement.checked);

  const handleAgreement = (id: string, value: boolean) => {
    setAgreements(prev => prev.map(agreement => agreement.id === id ? { ...agreement, checked: value } : agreement));
  };

  const handleAllAgreement = debounce(() => {
    if (allAgreement) {
      setAgreements(prev => prev.map(agreement => ({ ...agreement, checked: false })));
    } else {
      setAgreements(prev => prev.map(agreement => ({ ...agreement, checked: true })));
    }
  }, 100);

  return (
    <View className="flex-1 flex flex-col">
      <PalePurpleGradient />
      <View className="px-5 flex-1">
        <Image
          source={require('@assets/images/terms.png')}
          style={{ width: 128, height: 128 }}
        />
          <Text weight="semibold" size="20" textColor="black">
          서비스 이용을 위해
          </Text>
          <Text weight="semibold" size="20" textColor="black">
          약관 동의가 필요해요
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAllAgreement}
            delayPressIn={0}
          >
            <View className="flex flex-row gap-x-[10px] mt-[16px] mb-[10px]">
              <Check.Box checked={allAgreement} onChange={handleAllAgreement} />
              <Text weight="semibold" size="20" textColor="black">
                모두 동의합니다.
              </Text>
            </View>
          </TouchableOpacity>
        <View className="mb-[10px] flex flex-col ml-[35px]">
          <Text weight="light" size="13" textColor="pale-purple">
          "모두 동의"는 필수 및 선택 약관에 전부 동의하는 거예요.
          </Text>
          <Text weight="light" size="13" textColor="pale-purple">
          개별적으로 선택해서 동의하실 수도 있어요.
          </Text>
        </View>

        <Divider.Horizontal />

        <View className="flex flex-col gap-y-[22px] mt-[20px]">
          {agreements.map((agreement) => (
            <CheckboxLabel 
              key={agreement.id} 
              variant="symbol" 
              label={agreement.label} 
              checked={agreement.checked} 
              onChange={() => handleAgreement(agreement.id, !agreement.checked)} 
              link={agreement.link}
            />
          ))}
        </View>
      </View>

      <View className="px-5 mb-[58px] w-full">
        <Button onPress={() => router.push('/')} className="w-full" disabled={!isNext}>
          동의하고 계속하기 
        </Button>
      </View>
    </View>
  );
}

type Agreement = {
  id: string;
  label: string;
  link?: string;
  required: boolean;
  checked: boolean;
}

const AGREEMENTS: Agreement[] = [
  {
    id: 'privacy',
    label: '(필수) 개인정보 수집 및 이용 동의',
    link: 'https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145',
    required: true,
    checked: false
  },
  {
    id: 'terms',
    label: '(필수) 서비스 이용약관 동의',
    link: 'https://ruby-composer-6d2.notion.site/1cd1bbec5ba1805dbafbc9426a0aaa80',
    required: true,
    checked: false
  },
  {
    id: 'location',
    label: '(필수) 개인정보 처리방침 동의',
    link: 'https://www.notion.so/1cd1bbec5ba180a3a4bbdf9301683145',
    required: true,
    checked: false
  },
  {
    id: 'sensitive',
    label: '(필수) 민감정보 이용 동의',
    link: 'https://www.notion.so/1cd1bbec5ba180ae800ff36c46285274',
    required: true,
    checked: false
  },
  {
    id: 'marketing',
    label: '(선택) 마케팅 수신 동의',
    link: 'https://www.notion.so/1cd1bbec5ba1800daa29fd7a8d01b7c9',
    required: false,
    checked: false
  }
];
