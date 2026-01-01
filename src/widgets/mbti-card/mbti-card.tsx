import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { MBTICardProps, MBTIType } from './types';
import { getMBTIData } from './mbti-data';
import { getMBTIIcon } from './mbti-assets';
import { styles } from './styles';

export const MBTICard: React.FC<MBTICardProps> = ({
  mbti,
  showCompatibility = true,
  onCompatibilityPress,
  style,
}) => {
  const { t } = useTranslation();

  if (!mbti) {
    return null;
  }

  const mbtiData = getMBTIData(mbti);
  const iconSource = getMBTIIcon(mbti);
  const title = t(`${mbtiData.i18nKey}.title`);
  const description = t(`${mbtiData.i18nKey}.description`);
  const compatibilityLabel = t('widgets.mbti-card.compatibility.label');

  const handleCompatibilityPress = (type: MBTIType) => {
    if (onCompatibilityPress) {
      onCompatibilityPress(type);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.mbtiType}>{mbti}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>

        {showCompatibility && (
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityLabel}>{compatibilityLabel}</Text>
            <View style={styles.compatibilityTagsContainer}>
              {mbtiData.compatibility.map((compatibleType) => {
                const TagComponent = onCompatibilityPress ? TouchableOpacity : View;
                return (
                  <TagComponent
                    key={compatibleType}
                    style={styles.compatibilityTag}
                    onPress={() => handleCompatibilityPress(compatibleType)}
                    activeOpacity={onCompatibilityPress ? 0.7 : 1}
                  >
                    <Text style={styles.compatibilityTagText}>
                      #{compatibleType}
                    </Text>
                  </TagComponent>
                );
              })}
            </View>
          </View>
        )}
      </View>

      <View style={styles.iconContainer}>
        <Image source={iconSource} style={styles.icon} resizeMode="contain" />
      </View>
    </View>
  );
};
