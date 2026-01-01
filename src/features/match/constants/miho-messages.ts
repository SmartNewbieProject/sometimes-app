import { MihoMessage, RarityTier } from '../types/miho-message';
import { useTranslation } from 'react-i18next';

/**
 * Miho 메시지 상수
 * 실제 텍스트는 i18n으로 관리됨
 * features.match.miho_messages.{rarity}.{id}
 */

export const COMMON_MESSAGES: Omit<MihoMessage, 'rarity'>[] = [
  {
    id: 'C1',
    title: '', // i18n: features.match.miho_messages.common.C1.title
    lines: [], // i18n: features.match.miho_messages.common.C1.line1, line2
    tone: 'curious',
    contextTags: ['generic'],
  },
  {
    id: 'C2',
    title: "미호가_추천해요",
    lines: ["음_뭔가_통할_것_같은", '느낌이 들어요 ✨'],
    tone: 'friendly',
    contextTags: ['generic'],
  },
  {
    id: 'C3',
    title: "미호가_발견했어요",
    lines: ["두_분_사이에", '재밌는 공통점이 있어요 👀'],
    tone: 'playful',
    contextTags: ['common_interests'],
  },
  {
    id: 'C4',
    title: "미호의_직감이에요",
    lines: ["이_분이랑은", '편하게 시작할 수 있을 것 같아요 ☕'],
    tone: 'reassuring',
    contextTags: ['generic'],
  },
  {
    id: 'C5',
    title: "미호가_귀띔해요",
    lines: ["한번_프로필", '천천히 둘러보세요 📖'],
    tone: 'gentle',
    contextTags: ['generic'],
  },
  {
    id: 'C6',
    title: "미호의_소감이에요",
    lines: ["괜찮은_분_같은데요", '한번 대화해볼까요? 🌱'],
    tone: 'encouraging',
    contextTags: ['generic'],
  },
];

export const UNCOMMON_MESSAGES: Omit<MihoMessage, 'rarity'>[] = [
  {
    id: 'U1',
    title: "미호가_눈여겨봤어요",
    lines: ["오_이_분은", '뭔가 특별한 매력이 있어요 ✨'],
    tone: 'intrigued',
    contextTags: ['generic'],
  },
  {
    id: 'U2',
    title: "미호의_관찰이에요",
    lines: ["생각보다", '잘 맞을 것 같은 느낌이에요 💫'],
    tone: 'observant',
    contextTags: ['generic'],
  },
  {
    id: 'U3',
    title: "미호가_주목했어요",
    lines: ["두_분의_취향이", '묘하게 겹치네요 🎯'],
    tone: 'curious',
    contextTags: ['common_interests'],
  },
  {
    id: 'U4',
    title: "미호의_육감이에요",
    lines: ["이_분이랑은", '대화 주제가 많을 것 같아요 💭'],
    tone: 'confident',
    contextTags: ['common_interests'],
  },
  {
    id: 'U5',
    title: "미호가_발견했어요",
    lines: ["같은_학교_선배_후배인데", '분위기가 잘 맞을 것 같아요 🏫'],
    tone: 'excited',
    contextTags: ['same_university'],
  },
  {
    id: 'U6',
    title: "미호의_메모예요",
    lines: ["성격도_잘_맞고", '대화도 잘 통할 것 같아요 🗨️'],
    tone: 'thoughtful',
    contextTags: ['personality_match'],
  },
];

export const RARE_MESSAGES: Omit<MihoMessage, 'rarity'>[] = [
  {
    id: 'R1',
    title: "미호가_확신해요",
    lines: ["이_분이랑은", '진짜 잘 맞을 것 같아요! 💜'],
    tone: 'certain',
    contextTags: ['generic'],
  },
  {
    id: 'R2',
    title: "미호의_특별_추천이에요",
    lines: ["공통점도_많고", '분위기도 잘 맞을 것 같아요 ✨'],
    tone: 'enthusiastic',
    contextTags: ['common_interests'],
  },
  {
    id: 'R3',
    title: "미호가_흥분했어요",
    lines: ['쉿! 비밀인데요..🤫', "두_분_조합_꽤_괜찮아요"],
    tone: 'conspiratorial',
    contextTags: ['generic'],
  },
  {
    id: 'R4',
    title: "미호의_분석_결과예요",
    lines: ["가치관도_비슷하고", '대화가 술술 풀릴 것 같아요 🌟'],
    tone: 'analytical',
    contextTags: ['personality_match'],
  },
  {
    id: 'R5',
    title: "미호가_강추해요",
    lines: ["이_정도면", '설레도 좋을 것 같은데요? 💓'],
    tone: 'encouraging',
    contextTags: ['generic'],
  },
  {
    id: 'R6',
    title: "미호의_확신이에요",
    lines: ["같은_학교인데", '진짜 잘 맞을 것 같아요 🏫'],
    tone: 'confident',
    contextTags: ['same_university'],
  },
];

export const EPIC_MESSAGES: Omit<MihoMessage, 'rarity'>[] = [
  {
    id: 'E1',
    title: "미호가_놀랐어요",
    lines: ["헐_이건_좀", '역대급 조합인 것 같은데요?! 🔥'],
    tone: 'amazed',
    contextTags: ['generic'],
  },
  {
    id: 'E2',
    title: "미호의_긴급_추천이에요",
    lines: ["이_분_놓치면", '진짜 후회할 것 같아요! 💥'],
    tone: 'urgent',
    contextTags: ['generic'],
  },
  {
    id: 'E3',
    title: "미호가_확신합니다",
    lines: ["지금까지_본_매칭_중에", '손에 꼽을 정도로 잘 맞아요! ⭐'],
    tone: 'emphatic',
    contextTags: ['generic'],
  },
  {
    id: 'E4',
    title: "미호의_특급_발견이에요",
    lines: ["같은_학교에서_이런_인연", '놓치면 안 될 것 같아요 🏫✨'],
    tone: 'excited',
    contextTags: ['same_university'],
  },
  {
    id: 'E5',
    title: "미호가_장담해요",
    lines: ["이_정도_케미면", '첫 만남부터 편할 것 같아요! ✨'],
    tone: 'assured',
    contextTags: ['personality_match'],
  },
];

export const LEGENDARY_MESSAGES: Omit<MihoMessage, 'rarity'>[] = [
  {
    id: 'L1',
    title: "미호가_소리쳤어요",
    lines: ["잠깐", '이건.. 진짜 운명 아닌가요?! 💫'],
    tone: 'shocked',
    special: true,
    contextTags: ['generic'],
  },
  {
    id: 'L2',
    title: "미호의_최종_보스급_추천",
    lines: ["제가_여태_본_매칭_중", '최고로 잘 맞는 분이에요! 👑'],
    tone: 'ultimate',
    special: true,
    contextTags: ['generic'],
  },
  {
    id: 'L3',
    title: "미호가_확신합니다",
    lines: ["같은_학교에서_운명을_만났어요", '이건 진짜예요! 🏫👑'],
    tone: 'absolute',
    special: true,
    contextTags: ['same_university'],
  },
  {
    id: 'L4',
    title: "미호의_평생_한_번_추천",
    lines: ["제_경험상", '이 정도는 정말 드물어요! ✨'],
    tone: 'rare-event',
    special: true,
    contextTags: ['generic'],
  },
  {
    id: 'L5',
    title: "미호가_울컥했어요",
    lines: ["이게_바로", '대학생의 설렘 아닐까요? 💕'],
    tone: 'emotional',
    special: true,
    contextTags: ['generic'],
  },
];

export const ALL_MIHO_MESSAGES: MihoMessage[] = [
  ...COMMON_MESSAGES.map((m) => ({ ...m, rarity: RarityTier.COMMON })),
  ...UNCOMMON_MESSAGES.map((m) => ({ ...m, rarity: RarityTier.UNCOMMON })),
  ...RARE_MESSAGES.map((m) => ({ ...m, rarity: RarityTier.RARE })),
  ...EPIC_MESSAGES.map((m) => ({ ...m, rarity: RarityTier.EPIC })),
  ...LEGENDARY_MESSAGES.map((m) => ({ ...m, rarity: RarityTier.LEGENDARY })),
];
