import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import type { AgeOptionData, AgeOptionType } from "../types";

const FOX_FACE = require('@assets/images/age/fox-face.png');
const ARROW_UP = require('@assets/images/age/arrow-up.png');
const ARROW_BOTH = require('@assets/images/age/arrow-both.png');

interface AgeSelectorProps {
  value?: string;
  options: AgeOptionData[];
  onChange: (value: string) => void;
}

const CARD_GAP = 29;
const HORIZONTAL_PADDING = 31;
const MAX_CARD_SIZE = 151;

export function AgeSelector({ value, onChange, options }: AgeSelectorProps) {
  const { width: screenWidth } = useWindowDimensions();
  const calculatedSize = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
  const cardSize = Math.min(MAX_CARD_SIZE, Math.max(140, calculatedSize));

  if (options.length === 0) {
    return (
      <View style={styles.container}>
        <Text>옵션 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {options.slice(0, 2).map((item) => (
          <AgeCard
            key={item.value}
            option={item}
            isSelected={value === item.value}
            onSelect={() => onChange(item.value)}
            size={cardSize}
          />
        ))}
      </View>
      <View style={styles.row}>
        {options.slice(2, 4).map((item) => (
          <AgeCard
            key={item.value}
            option={item}
            isSelected={value === item.value}
            onSelect={() => onChange(item.value)}
            size={cardSize}
          />
        ))}
      </View>
    </View>
  );
}

interface AgeCardProps {
  option: AgeOptionData;
  isSelected: boolean;
  onSelect: () => void;
  size: number;
}

function AgeCard({ option, isSelected, onSelect, size }: AgeCardProps) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.card,
        { width: size, height: size },
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.cardInner}>
        <AgeCardImage type={option.type} />
        <Text
          style={styles.labelText}
          weight="semibold"
        >
          {option.label}
        </Text>

        <View
          style={[
            styles.badge,
            isSelected ? styles.badgePrimary : styles.badgeGray,
          ]}
        >
          <Text size="xs" textColor="white" weight="medium">
            {t("features.interest.ui.age-selector.select")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AgeCardImage({ type }: { type: AgeOptionType }) {
  switch (type) {
    case 'OLDER':
      return (
        <View style={styles.imageContainer}>
          <Image source={ARROW_UP} style={styles.arrowUp} resizeMode="contain" />
          <Image source={FOX_FACE} style={styles.foxFaceOlder} resizeMode="contain" />
        </View>
      );
    case 'YOUNGER':
      return (
        <View style={styles.imageContainer}>
          <Image source={FOX_FACE} style={styles.foxFaceYounger} resizeMode="contain" />
          <Image source={ARROW_UP} style={styles.arrowDown} resizeMode="contain" />
        </View>
      );
    case 'SAME_AGE':
      return (
        <View style={styles.imageContainerHorizontal}>
          <Image source={FOX_FACE} style={styles.foxFaceSame} resizeMode="contain" />
          <Image source={FOX_FACE} style={styles.foxFaceSame} resizeMode="contain" />
        </View>
      );
    case 'ANY':
    default:
      return (
        <View style={styles.imageContainerHorizontal}>
          <Image source={FOX_FACE} style={styles.foxFaceAny} resizeMode="contain" />
          <Image source={ARROW_BOTH} style={styles.arrowBoth} resizeMode="contain" />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
  },
  cardSelected: {
    backgroundColor: semanticColors.surface.tertiary,
    borderColor: semanticColors.brand.primary,
  },
  cardUnselected: {
    backgroundColor: semanticColors.surface.background,
    borderColor: semanticColors.brand.primaryLight,
  },
  cardInner: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: 8,
  },
  imageContainer: {
    width: 93,
    height: 95,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imageContainerHorizontal: {
    width: 117,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  arrowUp: {
    width: 49,
    height: 69,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  arrowDown: {
    width: 49,
    height: 69,
    position: 'absolute',
    top: 0,
    right: 8,
    transform: [{ rotate: '180deg' }],
  },
  foxFaceOlder: {
    width: 68,
    height: 61,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  foxFaceYounger: {
    width: 56,
    height: 50,
    position: 'absolute',
    bottom: 35,
    left: 0,
  },
  foxFaceSame: {
    width: 56,
    height: 50,
  },
  foxFaceAny: {
    width: 61,
    height: 54,
  },
  arrowBoth: {
    width: 60,
    height: 33,
    transform: [{ rotate: '270deg' }],
  },
  labelText: {
    fontSize: 20,
    color: semanticColors.brand.primary,
    marginTop: 8,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 20,
  },
  badgePrimary: {
    backgroundColor: semanticColors.brand.primary,
  },
  badgeGray: {
    backgroundColor: semanticColors.brand.primaryLight,
  },
});
