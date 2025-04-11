import { View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui/button';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';

export default function TermsScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <View className="flex-1 px-5">
        <View className="flex-1">
          {/* 약관 내용 */}
          <Text className="text-lg font-semibold mb-4">이용약관</Text>
          {/* 약관 내용들... */}
        </View>
        
        <View className="mt-auto mb-[58px]">
          <Button 
            variant="primary"
            onPress={() => router.push('/signup/email')}
            className="w-full"
          >
            다음
          </Button>
        </View>
      </View>
    </View>
  );
} 