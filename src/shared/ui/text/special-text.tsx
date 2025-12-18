import React from "react";
import { StyleSheet, View, type ViewStyle, type TextStyle } from "react-native";
import { Text, type TextProps } from "..";

export interface SpecialTextProps extends Omit<TextProps, "children" | "textColor" | "style"> {
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SpecialText: React.FC<SpecialTextProps> = ({
  text,
  size = "md",
  weight = "normal",
  style,
  textStyle,
  ...rest
}) => {
  const tokens = text.split(' ').filter(token => token.trim() !== '');

  if (tokens.length === 0) {
    return null;
  }

  const regularTokens = tokens.slice(0, -1);
  const lastToken = tokens[tokens.length - 1];

  return (
    <View style={[styles.container, style]}>
      {regularTokens.map((token, index) => (
        <Text
          key={`regular-${index}`}
          size={size}
          weight={weight}
          textColor="black"
          style={textStyle}
        >
          {token}
        </Text>
      ))}
      <Text
        key="last"
        size={size}
        weight={weight}
        textColor="purple"
        style={textStyle}
        {...rest}
      >
        {lastToken}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
});
