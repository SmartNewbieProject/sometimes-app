import {View, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import {Text, PalePurpleGradient, Button} from '@/src/shared/ui';
import {Image} from 'expo-image';
import {IconWrapper} from '@/src/shared/ui/icons';
import SmallTitle from '@assets/icons/small-title.svg';
import Signup from '@/src/features/signup';
import {useAuth} from '@/src/features/auth';
import {useModal} from '@/src/shared/hooks/use-modal';

export default function CommingSoonScreen() {
  const {form: signupForm} = Signup.useSignupProgress();
  const {profileDetails} = useAuth();
  const {showModal} = useModal();

  const onClickSeeYouLater = () =>
      showModal({
        title: '꼭 다시 만나요!',
        children: <Text>7월 27일, 꼭 다시 만나요!</Text>,
        primaryButton: {
          text: '확인',
          onClick: () => {
          },
        },
      });

  // 회원가입 데이터를 우선 확인하고, 없으면 로그인 프로필 데이터 사용
  const userName = signupForm.name || profileDetails?.name;

  return (
      <View style={styles.container}>
        <PalePurpleGradient/>
        <IconWrapper width={128} style={styles.iconWrapper}>
          <SmallTitle/>
        </IconWrapper>

        <View style={styles.contentContainer}>
          <Image
              source={require('@assets/images/commingsooncharacter.png')}
              style={{width: 200, height: 200}}
          />

          <View style={styles.textContainer}>
            <View style={styles.nameContainer}>
              <Text size="md" textColor="black" weight="semibold">
                {userName}님!
              </Text>
              <Text size="md" textColor="black" weight="semibold">
                빨리 보고싶어요!
              </Text>
            </View>

            <View style={styles.descriptionContainer}>
              <Text weight="medium" size="sm" style={{color: semanticColors.brand.deep}}>
                곧, 당신에게 꼭 맞는 사람을 소개해드릴게요.
              </Text>
              <Text weight="medium" size="sm" style={{color: semanticColors.brand.deep}}>
                <Text weight="medium" size="sm" textColor="dark">
                  7월 27일
                </Text>
                {', '}꼭 다시 만나요!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
              variant="primary"
              size="md"
              onPress={() => {
                onClickSeeYouLater();

              }}
              style={styles.button}
          >
            출시일에 다시 볼게요.
          </Button>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    color: semanticColors.brand.primary,
    paddingBottom: 32,
    paddingVertical: 32,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'column',
  },
  nameContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    marginBottom: 14,
    width: '100%',
  },
});
