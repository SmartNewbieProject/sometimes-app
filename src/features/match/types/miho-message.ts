export enum RarityTier {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export type MessageTone =
  | 'curious'
  | 'friendly'
  | 'playful'
  | 'reassuring'
  | 'gentle'
  | 'encouraging'
  | 'intrigued'
  | 'observant'
  | 'confident'
  | 'excited'
  | 'thoughtful'
  | 'certain'
  | 'enthusiastic'
  | 'conspiratorial'
  | 'analytical'
  | 'amazed'
  | 'urgent'
  | 'emphatic'
  | 'assured'
  | 'shocked'
  | 'ultimate'
  | 'absolute'
  | 'rare-event'
  | 'emotional';

export type ContextTag =
  | 'same_university'
  | 'common_interests'
  | 'personality_match'
  | 'schedule_overlap'
  | 'generic';

export interface MihoMessage {
  id: string;
  rarity: RarityTier;
  title: string;
  lines: string[];
  tone: MessageTone;
  special?: boolean;
  contextTags?: ContextTag[];
}

export interface MatchContext {
  matchScore: number;
  commonPoints?: string[];
  isFirstMatch?: boolean;
  sameUniversity?: boolean;
}

export interface RarityStyle {
  bubbleColor: string;
  accentColor: string;
  animation: 'fadeIn' | 'slideUp' | 'bounce' | 'shake' | 'heartbeat';
  duration: number;
  sparkle?: boolean;
  glow?: boolean;
  confetti?: boolean;
}
