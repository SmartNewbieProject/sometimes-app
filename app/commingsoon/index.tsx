import {View, ScrollView, TouchableOpacity} from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import {Text, PalePurpleGradient, Button} from '@/src/shared/ui';
import {Image} from 'expo-image';
import {IconWrapper} from '@/src/shared/ui/icons';
import SmallTitle from '@assets/icons/small-title.svg';
import Signup from '@/src/features/signup';
import {useAuth} from '@/src/features/auth';
import {useModal} from '@/src/shared/hooks/use-modal';
import { useTranslation } from 'react-i18next';

export default function CommingSoonScreen() {
  const {form: signupForm} = Signup.useSignupProgress();
  const {profileDetails} = useAuth();
  const {showModal} = useModal();
  const { t } = useTranslation();

  const onClickSeeYouLater = () =>
      showModal({
        title: t('features.commingsoon.ui.modal.title'),
        children: <Text>{t('features.commingsoon.ui.modal.message')}</Text>,
        primaryButton: {
          text: t('shareds.utils.common.confirm'),
          onClick: () => {
          },
        },
      });

  // 회원가입 데이터를 우선 확인하고, 없으면 로그인 프로필 데이터 사용
  const userName = signupForm.name || profileDetails?.name;

  return (
      <View className="flex-1 flex flex-col w-full items-center">
        <PalePurpleGradient/>
        <IconWrapper width={128} className="text-primaryPurple md:pb-[58px] py-8">
          <SmallTitle/>
        </IconWrapper>

        <View className="flex flex-col flex-1 items-center">
          <Image
              source={require('@assets/images/commingsooncharacter.webp')}
              style={{width: 200, height: 200}}
          />

          <View className="flex flex-col">
            <View className="mt-8 px-5">
              <Text size="md" textColor="black" weight="semibold">
                {t('features.commingsoon.ui.greeting', { name: userName })}
              </Text>
              <Text size="md" textColor="black" weight="semibold">
                {t('features.commingsoon.ui.title')}
              </Text>
            </View>

            <View className="mt-2 px-5">
              <Text weight="medium" size="sm" style={{color: semanticColors.brand.deep}}>
                {t('features.commingsoon.ui.description_1')}
              </Text>
              <Text weight="medium" size="sm" style={{color: semanticColors.brand.deep}}>
                <Text weight="medium" size="sm" textColor="dark">
                  {t('features.commingsoon.ui.date')}
                </Text>
                {', '}{t('features.commingsoon.ui.description_2', { date: '' }).trim()}
              </Text>
            </View>
          </View>
        </View>

        <View className="w-full px-5">
          <Button
              variant="primary"
              size="md"
              width="full"
              onPress={() => {
                onClickSeeYouLater();

              }}
              styles={{ marginBottom: 14 }}
          >
            {t('features.commingsoon.ui.cta_button')}
          </Button>
        </View>
      </View>
  );
}
