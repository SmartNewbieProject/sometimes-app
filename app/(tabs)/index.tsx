import { View, TextInput } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui/button';
import { IconWrapper } from '@/src/shared/ui/icons';
import SmallTitle from '@/assets/icons/paper-plane.svg'

export default function LoginScreen() {
  return (
    <View className="flex-1 purple-gradient-bg px-5 pt-10">
      {/* 로고 섹션 */}
      <View className="items-center space-y-2 mb-10">
        <Text className="text-2xl font-bold text-primaryPurple">SOMETIME</Text>
        <View className="bg-primaryPurple rounded-full p-4">
          <IconWrapper size={128} className="text-text-inverse">
            <SmallTitle />
          </IconWrapper>
        </View>
        <View className="items-center space-y-1">
          <Text className="text-xl font-bold">익숙한 하루에 설렘 하나,</Text>
          <Text className="text-lg text-gray">SOMETIME에서</Text>
        </View>
      </View>

      {/* 입력 폼 섹션 */}
      <View className="space-y-6">
        {/* 이메일 입력 */}
        <View className="space-y-2">
          <Text className="text-lg text-primaryPurple">이메일</Text>
          <TextInput
            className="w-full h-12 px-4 rounded-xl bg-surface-background border border-lightPurple"
            placeholder="이메일 주소"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 비밀번호 입력 */}
        <View className="space-y-2">
          <Text className="text-lg text-primaryPurple">비밀번호</Text>
          <TextInput
            className="w-full h-12 px-4 rounded-xl bg-surface-background border border-lightPurple"
            placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
        </View>

        {/* 아이디/비밀번호 찾기 */}
        <View className="flex-row justify-center space-x-4">
          <Text className="text-gray">아이디 찾기</Text>
          <Text className="text-gray">비밀번호 찾기</Text>
        </View>
      </View>

      {/* 버튼 섹션 */}
      <View className="mt-auto space-y-3 mb-8">
        <Button 
          variant="primary" 
          onPress={() => {}}
          className="w-full"
        >
          로그인
        </Button>
        <Button 
          variant="secondary" 
          onPress={() => {}}
          className="w-full"
        >
          회원가입
        </Button>
      </View>
    </View>
  );
}
