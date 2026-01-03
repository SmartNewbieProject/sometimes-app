import { ALL_MIHO_MESSAGES } from '../constants/miho-messages';
import { useTranslation } from 'react-i18next';
import {
  MihoMessage,
  RarityTier,
  MatchContext,
  RarityStyle,
  ContextTag,
} from '../types/miho-message';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

const RARITY_THRESHOLDS = {
  LEGENDARY: 99,
  EPIC: 95,
  RARE: 85,
  UNCOMMON: 60,
} as const;

export const RARITY_STYLES: Record<RarityTier, RarityStyle> = {
  [RarityTier.COMMON]: {
    bubbleColor: semanticColors.surface.secondary,
    accentColor: semanticColors.brand.accent,
    animation: 'fadeIn',
    duration: 300,
  },
  [RarityTier.UNCOMMON]: {
    bubbleColor: '#F0F7FF',
    accentColor: '#5B8DEF',
    animation: 'slideUp',
    duration: 400,
  },
  [RarityTier.RARE]: {
    bubbleColor: '#FFF0F5',
    accentColor: '#E056A0',
    animation: 'bounce',
    duration: 500,
    sparkle: true,
  },
  [RarityTier.EPIC]: {
    bubbleColor: '#FFF5E6',
    accentColor: '#FF8C42',
    animation: 'shake',
    duration: 600,
    sparkle: true,
    glow: true,
  },
  [RarityTier.LEGENDARY]: {
    bubbleColor: '#FFFBEB',
    accentColor: '#F59E0B',
    animation: 'heartbeat',
    duration: 800,
    sparkle: true,
    glow: true,
    confetti: true,
  },
};

function determineRarity(matchScore: number): RarityTier {
  const baseRandom = Math.random() * 100;
  const scoreBonus = matchScore * 0.3;
  const adjustedRoll = baseRandom + scoreBonus;

  if (adjustedRoll >= RARITY_THRESHOLDS.LEGENDARY) return RarityTier.LEGENDARY;
  if (adjustedRoll >= RARITY_THRESHOLDS.EPIC) return RarityTier.EPIC;
  if (adjustedRoll >= RARITY_THRESHOLDS.RARE) return RarityTier.RARE;
  if (adjustedRoll >= RARITY_THRESHOLDS.UNCOMMON) return RarityTier.UNCOMMON;
  return RarityTier.COMMON;
}

function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRelevantContextTags(context: MatchContext): ContextTag[] {
  const tags: ContextTag[] = [];

  if (context.sameUniversity) {
    tags.push('same_university');
  }

  if (context.commonPoints && context.commonPoints.length > 0) {
    tags.push('common_interests');
    if (context.commonPoints.some((p) =>
      p && (p.includes("common.성격") || p.includes('MBTI') || p.includes("common.가치관"))
    )) {
      tags.push('personality_match');
    }
  }

  return tags;
}

function filterByContext(
  messages: MihoMessage[],
  context: MatchContext
): MihoMessage[] {
  const relevantTags = getRelevantContextTags(context);

  if (relevantTags.length === 0) {
    return messages;
  }

  const contextMatched = messages.filter((m) =>
    m.contextTags?.some((tag) => relevantTags.includes(tag))
  );

  if (contextMatched.length > 0) {
    return contextMatched;
  }

  return messages;
}

export function getMihoMessage(context: MatchContext): MihoMessage {
  const { matchScore = 50, isFirstMatch = false } = context;

  let rarity = determineRarity(matchScore);

  if (isFirstMatch) {
    rarity = RarityTier.COMMON;
  }

  const candidates = ALL_MIHO_MESSAGES.filter((m) => m.rarity === rarity);
  const contextFiltered = filterByContext(candidates, context);
  const finalCandidates =
    contextFiltered.length > 0 ? contextFiltered : candidates;

  return randomPick(finalCandidates);
}

export function getRarityStyle(rarity: RarityTier): RarityStyle {
  return RARITY_STYLES[rarity];
}

export function getRarityLabel(rarity: RarityTier): string {
  const labels: Record<RarityTier, string> = {
    [RarityTier.COMMON]: '',
    [RarityTier.UNCOMMON]: '✨',
    [RarityTier.RARE]: '💜 Special',
    [RarityTier.EPIC]: '🔥 Epic',
    [RarityTier.LEGENDARY]: '👑 Legendary',
  };
  return labels[rarity];
}

/**
 * 미호 메시지의 i18n 키를 생성합니다
 * @param message - MihoMessage 객체
 * @returns i18n 키 객체 { titleKey, line1Key, line2Key }
 */
export function getMihoMessageI18nKeys(message: MihoMessage): {
  titleKey: string;
  line1Key: string;
  line2Key: string;
} {
  const rarityMap: Record<RarityTier, string> = {
    [RarityTier.COMMON]: 'common',
    [RarityTier.UNCOMMON]: 'uncommon',
    [RarityTier.RARE]: 'rare',
    [RarityTier.EPIC]: 'epic',
    [RarityTier.LEGENDARY]: 'legendary',
  };

  const rarity = rarityMap[message.rarity];
  const baseKey = `features.match.miho_messages.${rarity}.${message.id}`;

  return {
    titleKey: `${baseKey}.title`,
    line1Key: `${baseKey}.line1`,
    line2Key: `${baseKey}.line2`,
  };
}
