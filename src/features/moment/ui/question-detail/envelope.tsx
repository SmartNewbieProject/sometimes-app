import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Text } from '@/src/shared/ui';
import { envelopeStyles } from './envelope.styles';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon } from 'react-native-svg';
import colors from '@/src/shared/constants/colors';

interface EnvelopeProps {
  onPress: () => void;
  questionDate: string;
}

export const Envelope: React.FC<EnvelopeProps> = ({ onPress, questionDate }) => {
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.05, 1.15],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });

  return (
    <View style={envelopeStyles.container}>
      <TouchableOpacity
        style={envelopeStyles.envelopeWrapper}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            envelopeStyles.envelopeGlow,
            {
              width: 230,
              height: 130,
              opacity: glowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.brand.secondary, colors.brand.accent]}
            style={{ flex: 1, borderRadius: 20, opacity: 0.5 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <LinearGradient
          colors={["#F7F3FF", "#E2D5FF"]}
          style={envelopeStyles.envelopeContainer}
        >
          <View style={envelopeStyles.envelopeFlap}>
            <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <Polygon points="0,0 100,0 50,100" fill="rgba(255,255,255,0.5)" />
            </Svg>
          </View>
          <View style={envelopeStyles.heartButton}>
            <Heart size={24} color={colors.white} fill={colors.white} />
          </View>
          <Text
            size="xs"
            weight="semibold"
            textColor="accent"
            style={envelopeStyles.touchText}
          >
            TOUCH TO OPEN
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text
          size="sm"
          weight="medium"
          textColor="muted"
          style={envelopeStyles.dateText}
        >
          {questionDate}
        </Text>
        <Text
          size="2xl"
          weight="bold"
          textColor="primary"
          style={envelopeStyles.titleText}
        >
          질문이 도착했어요
        </Text>
        <Text
          size="sm"
          textColor="muted"
          style={envelopeStyles.subtitleText}
        >
          당신의 이야기를 들려주세요.
        </Text>
      </View>
    </View>
  );
};