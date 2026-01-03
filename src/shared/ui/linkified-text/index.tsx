import type React from "react";
import { Linking, Alert, Text as RNText } from "react-native";
import { Text, type TextProps } from "../text";
import { parseTextWithLinks } from "../../utils/link-utils";
import i18n from "@/src/shared/libs/i18n";

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
  numberOfLines,
  ellipsizeMode,
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
      console.error("Link open error:", error);
      Alert.alert(
        i18n.t("shareds.linkified-text.linkified_text.error_title"),
        i18n.t("shareds.linkified-text.linkified_text.cannot_open_link_message")
      );
    }
  };

  const segments = parseTextWithLinks(children || "");

  return (
    <Text
      {...textProps}
      style={style}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}-${segment.content.slice(0, 10)}`;

        if (segment.type === "link") {
          return (
            <RNText
              key={key}
              onPress={() => handleLinkPress(segment.content)}
              style={{ color: linkColor, textDecorationLine: "underline" }}
              suppressHighlighting
            >
              {segment.content}
            </RNText>
          );
        }

        return segment.content;
      })}
    </Text>
  );
};
