import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { textDarkPurple } from '@/src/shared/constants/colors';

interface IconProps extends SvgProps {
  style?: any;
  size?: number;
}

export const IconWrapper: React.FC<IconProps> = ({
  style,
  width,
  height,
  size = 24,
  children,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {React.cloneElement(children as React.ReactElement, {
        width: width || size,
        height: height || size,
        ...props
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    color: textDarkPurple,
  },
}); 