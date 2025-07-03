import { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';

const universityLogos = [
  require('@/assets/images/univ/bju.png'),
  require('@/assets/images/univ/cnu.png'),
  require('@/assets/images/univ/dbu.png'),
  require('@/assets/images/univ/ddu.png'),
  require('@/assets/images/univ/hbu.png'),
  require('@/assets/images/univ/hnu.png'),
  require('@/assets/images/univ/kaist.png'),
  require('@/assets/images/univ/kyu.png'),
  require('@/assets/images/univ/mwu.png'),
  require('@/assets/images/univ/uju.png'),
  require('@/assets/images/univ/wsu.png'),
];

const firstRowLogos = universityLogos.slice(0, 12);
const secondRowLogos = [...universityLogos].reverse();

interface UniversityLogosProps {
  logoSize?: number;
}

export default function UniversityLogos({ logoSize = 48 }: UniversityLogosProps) {
  const firstRowAnim = useRef(new Animated.Value(0)).current;
  const secondRowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const logoWithMargin = logoSize + 8;
    const singleSetWidth = firstRowLogos.length * logoWithMargin;

    const animateFirstRow = () => {
      firstRowAnim.setValue(0);
      Animated.timing(firstRowAnim, {
        toValue: -singleSetWidth,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(animateFirstRow);
    };

    animateFirstRow();
    return () => firstRowAnim.stopAnimation();
  }, [firstRowAnim, logoSize]);

  useEffect(() => {
    const logoWithMargin = logoSize + 8;
    const singleSetWidth = secondRowLogos.length * logoWithMargin;

    const animateSecondRow = () => {
      secondRowAnim.setValue(-singleSetWidth);
      Animated.timing(secondRowAnim, {
        toValue: 0,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(animateSecondRow);
    };

    animateSecondRow();
    return () => secondRowAnim.stopAnimation();
  }, [secondRowAnim, logoSize]);

  const renderLogoRow = (logos: number[], animatedValue: Animated.Value) => {
    const logoWithMargin = logoSize + 8;
    const singleSetWidth = logos.length * logoWithMargin;

    return (
      <View style={{ height: logoSize, marginBottom: 16, overflow: 'hidden' }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ translateX: animatedValue }],
            width: singleSetWidth * 2, // 원본 + 복사본으로 2배 크기
            height: logoSize,
          }}
        >
          {[...logos, ...logos].map((logo, index) => (
            <View
              key={index}
              style={{
                width: logoSize,
                height: logoSize,
                marginHorizontal: 4,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={logo}
                style={{ width: logoSize, height: logoSize }}
                contentFit="contain"
              />
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ width: '100%', paddingVertical: 16 }}>
      {renderLogoRow(firstRowLogos, firstRowAnim)}
      {renderLogoRow(secondRowLogos, secondRowAnim)}
    </View>
  );
}
