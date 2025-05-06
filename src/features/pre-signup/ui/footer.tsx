import React from 'react';
import { View } from 'react-native';
import { Button, Text } from '@shared/ui';
import { router } from 'expo-router';

interface FooterProps {
  trackEventAction?: (eventName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ trackEventAction = () => {} }) => {
  return (
    <View className="w-full mt-8">
      <View className="w-full px-4 py-3">
        <Button
          variant="primary"
          size="md"
          className="w-full py-3 rounded-full"
          onPress={() => {
            trackEventAction('signup_button_click');
            router.navigate('/auth/signup/terms');
          }}
        >
          빠르게 사전 가입하기
        </Button>
        <Button
          variant="outline"
          size="md"
          className="w-full py-3 rounded-full mt-3 bg-[#E2D9FF] border-[#E2D9FF]"
          onPress={() => {
            trackEventAction('login_button_click');
            router.navigate('/auth/login');
          }}
        >
          <Text
            weight="medium"
            size="md"
            className="text-center text-white"
          >
            로그인하기
          </Text>
        </Button>
      </View>

      <View className="w-full px-4 py-6 mt-4 mb-4">
        <Text className="text-[#888] text-[10px] text-center leading-5">
          상호명: 스마트 뉴비 | 사업장 소재지: 대전광역시 유성구 동서대로 125, S9동 202호 | 대표: 전준영 | 사업자 등록번호: 498-05-02914 | 통신판매업신고: 제 2025-대전유성-0530호 | 문의전화: 010-8465-2476 | 이메일: notify@smartnewb.com | 사업자정보
        </Text>
      </View>
    </View>
  );
};
