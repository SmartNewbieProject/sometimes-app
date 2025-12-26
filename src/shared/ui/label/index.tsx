import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text } from '../text';

type SizeType = 'sm' | 'md' | 'lg';

interface LabelProps {
  label: string;
  required?: boolean;
  size?: SizeType;
  style?: StyleProp<ViewStyle>;
  textColor?: "white" | "purple" | "light" | "dark" | "black" | "pale-purple";
}

export function Label({
  label: labelText,
  required = false,
  size = 'md',
  style,
  textColor = "purple",
}: LabelProps) {
  const getGapStyle = () => {
    switch (size) {
      case 'sm': return styles.gapSm;
      case 'lg': return styles.gapLg;
      default: return styles.gapMd;
    }
  };

  return (
    <View style={[styles.container, getGapStyle(), style]}>
      <Text
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        weight="semibold"
        textColor={textColor}
      >
        {labelText}
      </Text>
      {required && (
        <Text size={size === 'lg' ? 'md' : 'sm'} textColor={textColor}>
          *
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gapSm: {
    gap: 2,
  },
  gapMd: {
    gap: 4,
  },
  gapLg: {
    gap: 6,
  },
}); 