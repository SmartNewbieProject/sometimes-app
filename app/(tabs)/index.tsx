import { View, TextInput } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui/button';
import { IconWrapper } from '@/src/shared/ui/icons';
import SmallTitle from '@/assets/icons/paper-plane.svg'
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const {t} = useTranslation();
  
  return (
    <View className="flex-1 purple-gradient-bg px-5 pt-10">
      {/* 로고 섹션 */}
      <View className="items-center space-y-2 mb-10">
        <Text className="text-2xl font-bold text-primaryPurple">SOMETIME</Text>
        <View className="bg-primaryPurple rounded-full p-4">
          <IconWrapper size={128} className="text-white">
            <SmallTitle />
          </IconWrapper>
        </View>
        <View className="items-center space-y-1">
          <Text className="text-xl font-bold">{t("apps.tabs.index.subtitle")}</Text>
          <Text className="text-lg text-gray">{t("apps.tabs.index.subtitle_2")}</Text>
        </View>
      </View>

      {/* 입력 폼 섹션 */}
      <View className="space-y-6">
        {/* 이메일 입력 */}
                <View className="space-y-2">
          <Text className="text-lg text-primaryPurple">{t("apps.tabs.index.email")}</Text>
          <TextInput
            className="w-full h-12 px-4 rounded-xl bg-white border border-lightPurple"
            placeholder={t("apps.tabs.index.email_placeholder")}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 비밀번호 입력 */}
        <View className="space-y-2">
          <Text className="text-lg text-primaryPurple">{t("apps.tabs.index.password")}</Text>
          <TextInput
            className="w-full h-12 px-4 rounded-xl bg-white border border-lightPurple"
            placeholder={t("apps.tabs.index.password_placeholder")}
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
        </View>

        {/* 아이디/비밀번호 찾기 */}
        <View className="flex-row justify-center space-x-4">
          <Text className="text-gray">{t("apps.tabs.index.find_id")}</Text>
          <Text className="text-gray">{t("apps.tabs.index.find_password")}</Text>
        </View>
      </View>

      {/* 버튼 섹션 */}
      <View className="mt-auto space-y-3 mb-8">
        <Button 
          variant="primary" 
          onPress={() => {}}
          className="w-full"
        >
          {t("apps.tabs.index.login")}
        </Button>
        <Button 
          variant="secondary" 
          onPress={() => {}}
          className="w-full"
        >
          {t("apps.tabs.index.register")}
        </Button>
      </View>
    </View>
  );
}
