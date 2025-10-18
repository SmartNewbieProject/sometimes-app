import type React from "react";
import { Linking, Alert, Text as RNText, type TextStyle } from "react-native";
import { Text, type TextProps } from "../text";
import { parseTextWithLinks } from "../../utils/link-utils";

export interface LinkifiedTextProps extends Omit<TextProps, "children"> {
  children: string;
  linkColor?: string;
  onLinkPress?: (url: string) => void;
}

export const LinkifiedText: React.FC<LinkifiedTextProps> = ({
  children,
  linkColor = "#8B5CF6",
  onLinkPress,
  style,
  ...textProps
}) => {
  const handleLinkPress = async (url: string) => {
    if (onLinkPress) {
      onLinkPress(url);
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("링크 열기 오류:", error);
      Alert.alert("오류", "링크를 열 수 없습니다.");
    }
  };

  const segments = parseTextWithLinks(children || "");

  return (
    <Text {...textProps}>
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}-${segment.content.slice(0, 10)}`;

        if (segment.type === "link") {
          return (
            <RNText
              key={key}
              onPress={() => handleLinkPress(segment.content)}
              style={[
                (style as TextStyle) || undefined,
                { color: linkColor, textDecorationLine: "underline" },
              ]}
              suppressHighlighting
            >
              {segment.content}
            </RNText>
          );
        }

        return (
          <RNText key={key} style={style as TextStyle}>
            {segment.content}
          </RNText>
        );
      })}
    </Text>
  );
};
