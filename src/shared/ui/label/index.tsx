import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui/text';

interface LabelProps {
  label: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  textColor?: "white" | "purple" | "light" | "dark" | "black" | "pale-purple";
}

export function Label({
  label: labelText,
  required = false,
  size = 'md',
  textColor = "purple",
}: LabelProps) {
  const labelStyles = createLabelStyles({ size });

  return (
    <View style={labelStyles.container}>
      <Text
        size={size}
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

const createLabelStyles = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const sizeStyles = {
    sm: { gap: 2 },
    md: { gap: 4 },
    lg: { gap: 6 },
  };

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      ...sizeStyles[size],
    },
  };
}; 