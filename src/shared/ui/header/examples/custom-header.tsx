import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Header } from '..';
import { router } from 'expo-router';

/**
 * 이 예시는 Compound Pattern을 사용하여 커스텀 헤더를 구현하는 방법을 보여줍니다.
 * 이 방식을 사용하면 Header 컴포넌트의 내부 구조를 직접 조작할 수 있습니다.
 */
export function CustomHeaderExample() {
  return (
    <Header.Container>
      <Header.LeftContent>
        <TouchableOpacity onPress={() => router.back()}>
          <View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
            <Text size="md" weight="bold" textColor="purple">←</Text>
          </View>
        </TouchableOpacity>
      </Header.LeftContent>
      
      <Header.Logo showLogo={true} logoSize={64} />
      
      <Header.RightContent>
        <TouchableOpacity>
          <View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
            <Text size="md" weight="bold" textColor="purple">설정</Text>
          </View>
        </TouchableOpacity>
      </Header.RightContent>
    </Header.Container>
  );
}

/**
 * 이 예시는 기본 Header 컴포넌트를 사용하는 방법을 보여줍니다.
 * 이 방식은 간단한 사용 사례에 적합합니다.
 */
export function SimpleHeaderExample() {
  return (
    <Header
      title="커스텀 헤더"
      showLogo={true}
      logoSize={64}
      showBackButton={true}
      rightContent={
        <TouchableOpacity>
          <View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
            <Text size="md" weight="bold" textColor="purple">설정</Text>
          </View>
        </TouchableOpacity>
      }
    />
  );
}
