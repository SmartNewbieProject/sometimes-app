import type React from 'react';
import { TouchableOpacity, Linking, Alert, View } from 'react-native';
import { Text, type TextProps } from '../text';
import { parseTextWithLinks } from '../../utils/link-utils';

export interface LinkifiedTextProps extends Omit<TextProps, 'children'> {
  children: string;
  linkColor?: string;
  onLinkPress?: (url: string) => void;
}

/**
 * 텍스트에서 링크를 탐지하고 클릭 가능한 링크로 렌더링하는 컴포넌트
 */
export const LinkifiedText: React.FC<LinkifiedTextProps> = ({
  children,
  linkColor = '#8B5CF6',
  onLinkPress,
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
      console.error('링크 열기 오류:', error);
      Alert.alert('오류', '링크를 열 수 없습니다.');
    }
  };

  const segments = parseTextWithLinks(children || '');

  if (segments.length === 1 && segments[0].type === 'text') {
    return <Text {...textProps}>{segments[0].content}</Text>;
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}-${segment.content.slice(0, 10)}`;

        if (segment.type === 'link') {
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleLinkPress(segment.content)}
              activeOpacity={0.7}
            >
              <Text
                {...textProps}
                style={{
                  ...textProps.style,
                  color: linkColor,
                  textDecorationLine: 'underline'
                }}
              >
                {segment.content}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <Text key={key} {...textProps}>
            {segment.content}
          </Text>
        );
      })}
    </View>
  );
};
