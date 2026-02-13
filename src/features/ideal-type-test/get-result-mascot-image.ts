import type { ImageSourcePropType } from 'react-native';
import type { ResultTypeId } from './types';

const RESULT_MASCOT_IMAGES: Record<string, ImageSourcePropType> = {
	romantic_emotional: require('@assets/images/ideal-type-test/mascot-romantic-emotional.png'),
	warm_healing: require('@assets/images/ideal-type-test/mascot-warm-healing.png'),
	free_explorer: require('@assets/images/ideal-type-test/mascot-free-explorer.png'),
	reliable_trust: require('@assets/images/ideal-type-test/mascot-reliable-trust.png'),
	energetic_active: require('@assets/images/ideal-type-test/mascot-energetic-active.png'),
};

const FALLBACK_MASCOT: ImageSourcePropType = require('@assets/images/ideal-type-test/mascot.png');

export function getResultMascotImage(resultTypeId: ResultTypeId | string): ImageSourcePropType {
	return RESULT_MASCOT_IMAGES[resultTypeId] || FALLBACK_MASCOT;
}

/**
 * 이상형 결과 이름 → 마스코트 ID + 카드 표시 데이터 매핑
 * 프로필 임베딩 API에서 name, tags만 제공하므로 클라이언트에서 추가 메타데이터 보완
 */
interface IdealTypeCardMeta {
	mascotId: string;
	subtitle: string;
	description: string;
}

const IDEAL_TYPE_CARD_META_KO: Record<string, IdealTypeCardMeta> = {
	'로맨틱 감성형': {
		mascotId: 'romantic_emotional',
		subtitle: '깊은 감정적 교류를 원하는',
		description:
			'기념일이 아니어도 진심 어린 편지를 주고받을 수 있는\n감성이 풍부한 사람을 만나고 싶어요.',
	},
	'따뜻한 힐링형': {
		mascotId: 'warm_healing',
		subtitle: '편안하고 따뜻한 관계를 원하는',
		description: '바쁜 하루 끝에 서로의 이야기를 나누며\n마음이 따뜻해지는 연애를 하고 싶어요.',
	},
	'자유로운 탐험가형': {
		mascotId: 'free_explorer',
		subtitle: '서로의 성장을 응원하는 관계를 원하는',
		description:
			'서로의 꿈을 응원하면서도 가끔은 계획 없이 훌쩍\n여행을 떠날 수 있는 자유로운 파트너가 좋아요.',
	},
	'든든한 신뢰형': {
		mascotId: 'reliable_trust',
		subtitle: '믿음직하고 안정적인 관계를 원하는',
		description:
			'불안함보다는 확신을 주는 사람, 시간이 지날수록\n믿음이 더 단단해지는 진솔한 연애를 하고 싶어요.',
	},
	'에너지 넘치는 활발형': {
		mascotId: 'energetic_active',
		subtitle: '함께 웃고 즐기는 관계를 원하는',
		description:
			'사소한 장난에도 같이 웃음을 터뜨리고 매 순간을\n더 즐겁게 만들어줄 에너자이저가 좋아요.',
	},
};

const IDEAL_TYPE_CARD_META_JA: Record<string, IdealTypeCardMeta> = {
	ロマンチック感性型: {
		mascotId: 'romantic_emotional',
		subtitle: '深い感情的交流を求める',
		description: '記念日でなくても心のこもった手紙を\n交わせる感性豊かな人に出会いたいです。',
	},
	温かいヒーリング型: {
		mascotId: 'warm_healing',
		subtitle: '穏やかで温かい関係を求める',
		description: '忙しい一日の終わりにお互いの話を分かち合い\n心が温まる恋愛をしたいです。',
	},
	自由な探険家型: {
		mascotId: 'free_explorer',
		subtitle: 'お互いの成長を応援する関係を求める',
		description:
			'お互いの夢を応援しながらも時には計画なしに\nふらっと旅に出られる自由なパートナーがいいです。',
	},
	頼れる信頼型: {
		mascotId: 'reliable_trust',
		subtitle: '信頼できる安定した関係を求める',
		description: '不安よりも確信をくれる人、時間が経つほど\n信頼が深まる誠実な恋愛をしたいです。',
	},
	エネルギッシュな活発型: {
		mascotId: 'energetic_active',
		subtitle: '一緒に笑い楽しむ関係を求める',
		description:
			'ちょっとしたいたずらにも一緒に笑い合って毎瞬間を\nもっと楽しくしてくれるエナジャイザーがいいです。',
	},
};

export function getIdealTypeCardMeta(name: string, lang = 'ko'): IdealTypeCardMeta | null {
	const meta = lang.startsWith('ja') ? IDEAL_TYPE_CARD_META_JA : IDEAL_TYPE_CARD_META_KO;
	return meta[name] ?? null;
}

export function getResultMascotImageByName(name: string, lang = 'ko'): ImageSourcePropType {
	const meta = getIdealTypeCardMeta(name, lang);
	if (meta) {
		return RESULT_MASCOT_IMAGES[meta.mascotId] || FALLBACK_MASCOT;
	}
	return FALLBACK_MASCOT;
}
