import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

interface TypingEffectProps {
  isActive: boolean;
}

export const TypingEffect = ({ isActive }: TypingEffectProps) => {
  const message1 = '안녕하세요! 반가워요 ☺️';
  const message2 = '저도 OO 좋아해요!';

  const [displayText1, setDisplayText1] = useState('');
  const [displayText2, setDisplayText2] = useState('');

  const progress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const elapsed = Date.now() % 5500;

        if (elapsed < 2000) {
          const length = Math.floor((elapsed / 2000) * message1.length);
          setDisplayText1(message1.substring(0, length));
          setDisplayText2('');
        } else if (elapsed < 3500) {
          setDisplayText1(message1);
          const length = Math.floor(((elapsed - 2000) / 1500) * message2.length);
          setDisplayText2(message2.substring(0, length));
        } else {
          setDisplayText1(message1);
          setDisplayText2(message2);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayText1('');
      setDisplayText2('');
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <View style={styles.bubbleLeft}>
        <Text style={styles.bubbleText}>{displayText1}</Text>
      </View>
      <View style={styles.bubbleRight}>
        <Text style={[styles.bubbleText, styles.bubbleTextRight]}>
          {displayText2}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardPurple,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '80%',
    minHeight: 44,
    justifyContent: 'center',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryPurple,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: '80%',
    minHeight: 44,
    justifyContent: 'center',
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  bubbleTextRight: {
    color: colors.white,
  },
});
