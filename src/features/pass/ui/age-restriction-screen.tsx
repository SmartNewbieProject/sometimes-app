import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui/button';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { IconWrapper } from '@/src/shared/ui/icons';
import { router } from 'expo-router';
import SmallTitle from '@/assets/icons/small-title.svg';

interface AgeRestrictionScreenProps {
  onGoBack?: () => void;
}

/**
 * 만 18세 미만 사용자에게 표시되는 나이 제한 안내 화면
 */
export const AgeRestrictionScreen: React.FC<AgeRestrictionScreenProps> = ({
  onGoBack
}) => {
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      // 기본적으로 로그인 화면으로 돌아가기
      router.replace('/auth/login');
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F7F3FF' }}>
      <PalePurpleGradient />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 로고 */}
        <View className="items-center pt-8 pb-4">
          <IconWrapper style={{ width: 150, height: 150 }}>
            <SmallTitle width={150} height={150} />
          </IconWrapper>
        </View>

        <View className="flex-1 px-5 min-h-screen">
        {/* 상단 이미지 */}
        <View className="items-center mb-8">
          <Image
            source={require('@assets/images/limit_signup.png')}
            style={{ width: 200, height: 200 }}
            className="mb-6"
          />
        </View>

        {/* 메인 텍스트 */}
        <View className="mb-8">
          <Text weight="semibold" size="20" textColor="black" className="text-center mb-2">
            만 18세 미만은 가입이 불가능해요
          </Text>
          <Text size="md" textColor="pale-purple" className="text-center leading-6 px-4">
            안전하고 건전한 만남을 위해 만 18세 이상만 가입 가능해요.
          </Text>
        </View>

        {/* 안내 정보 */}
        <View className="bg-white rounded-2xl p-6 mb-8 shadow-sm mx-2">
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-lightPurple rounded-full items-center justify-center mr-3">
              <Text size="sm" textColor="purple" weight="semibold">ℹ</Text>
            </View>
            <Text weight="semibold" size="md" textColor="black">
              확인된 이용 조건
            </Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <Text size="sm" textColor="pale-purple" className="mr-2 mt-0.5">•</Text>
              <Text size="sm" textColor="black" className="flex-1">
                만 18세 이상
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text size="sm" textColor="pale-purple" className="mr-2 mt-0.5">•</Text>
              <Text size="sm" textColor="black" className="flex-1">
                대학교 재학 중 또는 졸업
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text size="sm" textColor="pale-purple" className="mr-2 mt-0.5">•</Text>
              <Text size="sm" textColor="black" className="flex-1">
                대학 이메일 인증 필수
              </Text>
            </View>
          </View>
        </View>

        {/* 하단 텍스트 */}
        <View className="mb-8">
          <Text weight="semibold" size="18" textColor="black" className="text-center mb-2">
            만 18세가 되면 다시 찾아주세요!
          </Text>
          <Text size="sm" textColor="pale-purple" className="text-center px-4">
            생년월일 기준으로 가입 가능 여부를 확인해요
          </Text>
        </View>

        {/* 버튼 */}
        <View className="mt-auto px-2 pb-4">
          <Button
            variant="primary"
            size="md"
            onPress={handleGoBack}
            className="w-full"
          >
            이상형 찾으러 가기 →
          </Button>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
