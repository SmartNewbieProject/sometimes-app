import React from "react";
import { View, type ViewStyle } from "react-native";
import { Text, type TextProps } from "..";

export interface SpecialTextProps extends Omit<TextProps, "children" | "textColor" | "style"> {
  text: string;
  className?: string;
  style?: ViewStyle;
}

export const SpecialText: React.FC<SpecialTextProps> = ({
  text,
  size = "md",
  weight = "normal",
  className = "",
  style,
  ...rest
}) => {
  // 텍스트를 개행 문자(\n)로 토큰화
  const tokens = text.split(' ').filter(token => token.trim() !== '');

  console.log({ tokens })

  if (tokens.length === 0) {
    return null;
  }

  // 마지막 요소를 제외한 모든 토큰은 black 색상으로 렌더링
  const regularTokens = tokens.slice(0, -1);
  // 마지막 토큰은 primaryPurple 색상으로 렌더링
  const lastToken = tokens[tokens.length - 1];

  return (
    <View style={[{ flexDirection: 'row', gap: 4, alignItems: 'center' }, style]}>
      {regularTokens.map((token, index) => (
        <Text
          key={`regular-${index}`}
          size={size}
          weight={weight}
          textColor="black"
          className={className}
        >
          {token}
        </Text>
      ))}
      <Text
        key="last"
        size={size}
        weight={weight}
        textColor="purple"
        className={className}
        {...rest}
      >
        {lastToken}
      </Text>
    </View>
  );
};
