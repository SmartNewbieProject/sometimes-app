import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui/button';
import { IconWrapper } from '@/src/shared/ui/icons';
import LogoIcon from '@/assets/icons/paper-plane.svg';
import SmallTitle from '@/assets/icons/small-title.svg';
import { Input } from '@/src/shared/ui/input';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';

const styles = StyleSheet.create({
  shadowText: {
    textShadowColor: '#A9A9A9',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default function LoginScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-10">
        {/* 로고 섹션 */}
        <View className="flex flex-col items-center gap-y-2">
          <IconWrapper width={128} className="text-primaryPurple pb-[24px] md:pb-[58px]">
            <SmallTitle />
          </IconWrapper>
          <View className="bg-primaryPurple rounded-full p-4">
            <IconWrapper size={128} className="text-white">
              <LogoIcon />
            </IconWrapper>
          </View>
          <View className="items-center pt-[8px] flex flex-col gap-y-[6px]">
            <Text className="text-[25px] font-semibold text-black">익숙한 하루에 설렘 하나,</Text>
            <Text className="text-[15px] text-[#4F4F4F]" style={styles.shadowText}>SOMETIME에서</Text>
          </View>
        </View>

        {/* 입력 폼 섹션 */}
        <View className="flex flex-col gap-y-[40px] mt-8">
          {/* 이메일 입력 */}
          <View className="flex flex-col gap-y-2">
            <Text className="text-[18px] font-semibold text-primaryPurple">이메일</Text>
            <Input
              placeholder="이메일 주소"
            />
          </View>

          {/* 비밀번호 입력 */}
          <View>
            <Text className="text-[18px] font-semibold text-primaryPurple">비밀번호</Text>
            <Input
              placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
            />
          </View>

          {/* 아이디/비밀번호 찾기 */}
          <View className="flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-600">아이디 찾기</Text>
            <Text className="text-gray-300">|</Text>
            <Text className="text-gray-600">비밀번호 찾기</Text>
          </View>
        </View>

        {/* 버튼 섹션 */}
        <View className="mt-auto flex flex-col gap-y-2 mb-[58px] pt-[58px]">
          <Button 
            size="md"
            variant="primary" 
            onPress={() => {}}
            className="w-full"
          >
            로그인
          </Button>
          <Button 
            size="md"
            variant="secondary" 
            onPress={() => {}}
            className="w-full"
            textColor="purple"
          >
            회원가입
          </Button>
        </View>
      </View>
    </View>
  );
} 