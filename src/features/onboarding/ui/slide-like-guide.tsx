import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/src/shared/constants/colors';
import type { SlideComponent } from '../types';

const mockManImage = require('@assets/images/onboarding/profile/mock_man_0.png');
const mockGirlImage = require('@assets/images/onboarding/profile/mock_girl_0.png');
const pnuLogo = require('@assets/images/univ/busan/pnu.webp');
const deuLogo = require('@assets/images/univ/busan/deu.webp');

interface MockProfileCardProps {
  image: any;
  age: number;
  university: string;
  universityLogo: any;
  keywords: string[];
  style?: object;
}

const MockProfileCard = ({
  image,
  age,
  university,
  universityLogo,
  keywords,
  style,
}: MockProfileCardProps) => (
  <View style={[styles.profileCard, style]}>
    <ImageBackground source={image} style={styles.profileImage} imageStyle={styles.profileImageStyle}>
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
        style={styles.cardGradient}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.ageText}>만 {age}세</Text>
        <View style={styles.universityRow}>
          <Text style={styles.universityText}>#{university}</Text>
          <Image source={universityLogo} style={styles.universityLogo} />
        </View>
        <View style={styles.keywordsRow}>
          {keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  </View>
);

export const SlideLikeGuide: SlideComponent = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>
          {t('features.onboarding.slides.likeGuide.headline')}
        </Text>
        <Text style={styles.subtext}>
          {t('features.onboarding.slides.likeGuide.subtext')}
        </Text>

        <View style={styles.illustrationArea}>
          <View style={styles.cardsContainer}>
            <MockProfileCard
              image={mockGirlImage}
              age={23}
              university={t("ui.부산대")}
              universityLogo={pnuLogo}
              keywords={[t("ui.다정한"), 'ENFP']}
              style={styles.leftCard}
            />
            <MockProfileCard
              image={mockManImage}
              age={25}
              university={t("ui.동의대")}
              universityLogo={deuLogo}
              keywords={[t("ui.유머있는"), 'ENTP']}
              style={styles.rightCard}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtext: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  illustrationArea: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  profileCard: {
    width: 140,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  leftCard: {
    transform: [{ rotate: '-6deg' }],
    marginRight: -20,
    zIndex: 1,
  },
  rightCard: {
    transform: [{ rotate: '6deg' }],
    marginLeft: -20,
    zIndex: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  profileImageStyle: {
    borderRadius: 16,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cardInfo: {
    padding: 10,
  },
  ageText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: colors.white,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  universityText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: colors.white,
  },
  universityLogo: {
    width: 14,
    height: 14,
    marginLeft: 4,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  keywordTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  keywordText: {
    fontSize: 10,
    fontFamily: 'Pretendard-Medium',
    color: colors.white,
  },
});
