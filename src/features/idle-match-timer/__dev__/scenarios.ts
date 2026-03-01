/**
 * V3.1 Matching UI E2E 테스트 시나리오
 *
 * 사용법:
 *   1. useDevScenario() 스토어에서 setScenario(번호) 호출
 *   2. 번호에 해당하는 mock 데이터가 V3.1 query를 대체
 *   3. setScenario(null) → 실제 API로 복원
 *
 * 시나리오 목록:
 *   #1 normal        — primary: open/scheduled,    secondary: 없음
 *   #2 pre21_rematch — primary: open/rematch,      secondary: waiting/scheduled
 *   #3 post21_swap   — primary: open/scheduled,    secondary: open/rematch
 *   #4 post21_rematch— primary: open/rematch,      secondary: open/scheduled
 *   #5 waiting       — primary: waiting/scheduled,  secondary: 없음
 *   #6 pending       — primary: pending-approval,   secondary: 없음
 *   #7 no_pool       — primary: not-found + NO_MATCH_POOL
 *   #8 filtered      — primary: not-found + FILTERED_OUT
 *   #9 already       — primary: not-found + ALREADY_MATCHED
 */

import { dayUtils } from '@/src/shared/libs';
import type { UserProfile } from '@/src/types/user';
import type { MatchComposite, MatchDetailsV31 } from '../types-v31';

// ── 공통 mock 파트너 ────────────────────────────────
const MOCK_PARTNER_A = {
	id: 'mock-user-a',
	name: '지우',
	age: 24,
	gender: 'FEMALE' as const,
	mbti: 'ENFP',
	rank: null,
	instagramId: null,
	profileImages: [
		{
			id: 'img-a1',
			order: 0,
			slotIndex: 0,
			isMain: true,
			url: 'https://picsum.photos/seed/partner-a/400/400',
			imageUrl: 'https://picsum.photos/seed/partner-a/400/400',
		},
	],
	universityDetails: {
		name: '연세대학교',
		department: '심리학과',
		grade: '3학년',
		authentication: true,
	},
	preferences: [],
	characteristics: [
		{
			typeName: '연애 스타일',
			selectedOptions: [
				{ id: 'ds1', displayName: '다정한' },
				{ id: 'ds2', displayName: '유머러스한' },
			],
		},
	],
	additionalPreferences: null,
	introductions: [],
	introduction: null,
	keywords: null,
	deletedAt: null,
	updatedAt: dayUtils.create().subtract(30, 'minute').toISOString(),
	phoneNumber: '',
};

const MOCK_PARTNER_B = {
	id: 'mock-user-b',
	name: '수현',
	age: 25,
	gender: 'FEMALE' as const,
	mbti: 'INTJ',
	rank: null,
	instagramId: null,
	profileImages: [
		{
			id: 'img-b1',
			order: 0,
			slotIndex: 0,
			isMain: true,
			url: 'https://picsum.photos/seed/partner-b/400/400',
			imageUrl: 'https://picsum.photos/seed/partner-b/400/400',
		},
	],
	universityDetails: {
		name: '고려대학교',
		department: '경영학과',
		grade: '4학년',
		authentication: true,
	},
	preferences: [],
	characteristics: [
		{
			typeName: '연애 스타일',
			selectedOptions: [
				{ id: 'ds3', displayName: '지적인' },
				{ id: 'ds4', displayName: '차분한' },
			],
		},
	],
	additionalPreferences: null,
	introductions: [],
	introduction: null,
	keywords: null,
	deletedAt: null,
	updatedAt: dayUtils.create().subtract(15, 'minute').toISOString(),
	phoneNumber: '',
};

// ── 헬퍼 ────────────────────────────────────────────
const hoursFromNow = (h: number) => dayUtils.create().add(h, 'hour');
const daysFromNow = (d: number) => dayUtils.create().add(d, 'day');

// ── 시나리오 정의 ───────────────────────────────────
type ScenarioId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
	1: '#1 normal — 정기매칭 open, secondary 없음',
	2: '#2 pre21_rematch — 리매칭 open + 정기 waiting',
	3: '#3 post21_swap — 정기 open + 리매칭 open',
	4: '#4 post21_rematch — 리매칭 open + 정기 open',
	5: '#5 waiting — 정기매칭 대기, secondary 없음',
	6: '#6 pending — 프로필 심사 중, secondary 없음',
	7: '#7 no_pool — 매칭풀 없음 (not-found + NO_MATCH_POOL)',
	8: '#8 filtered — 필터 제외 (not-found + FILTERED_OUT)',
	9: '#9 already — 이미 매칭됨 (not-found + ALREADY_MATCHED)',
};

/** Speed Dial 칩에 표시할 짧은 라벨 */
export const SCENARIO_SHORT: Record<ScenarioId, { label: string; color: string }> = {
	1: { label: '정기', color: '#7A4AE2' },
	2: { label: '리+대기', color: '#FF8C42' },
	3: { label: '정+리', color: '#7A4AE2' },
	4: { label: '리+정', color: '#FF8C42' },
	5: { label: '대기', color: '#9CA3AF' },
	6: { label: '심사', color: '#F59E0B' },
	7: { label: '풀없음', color: '#EF4444' },
	8: { label: '필터', color: '#F97316' },
	9: { label: '기매칭', color: '#6B7280' },
};

const buildScenario = (id: ScenarioId): MatchComposite => {
	switch (id) {
		// ── #1 normal: 기존 UI 동일. PeekSheet 없음. Badge 없음 ──
		case 1:
			return {
				primary: {
					id: 'match-1a',
					type: 'open',
					category: 'scheduled',
					endOfView: hoursFromNow(20),
					partner: MOCK_PARTNER_A as unknown as UserProfile,
					untilNext: null,
					connectionId: 'conn-1a',
					matchedAt: dayUtils.create().subtract(1, 'hour').toISOString(),
				} as MatchDetailsV31,
			};

		// ── #2 pre21_rematch: 주황 카드 + "리매칭" badge + PeekSheet(D-? 카운트다운) ──
		case 2:
			return {
				primary: {
					id: 'match-2a',
					type: 'open',
					category: 'rematch',
					endOfView: hoursFromNow(20),
					partner: MOCK_PARTNER_A as unknown as UserProfile,
					untilNext: null,
					connectionId: 'conn-2a',
					matchedAt: dayUtils.create().subtract(30, 'minute').toISOString(),
				} as MatchDetailsV31,
				secondary: {
					id: null,
					type: 'waiting',
					category: 'scheduled',
					endOfView: null,
					partner: null,
					untilNext: daysFromNow(2).format('YYYY-MM-DD 21:00:00'),
					connectionId: null,
				} as MatchDetailsV31,
			};

		// ── #3 post21_swap: 보라 카드 + "정기" badge + PeekSheet(리매칭 파트너 미니프로필) ──
		case 3:
			return {
				primary: {
					id: 'match-3a',
					type: 'open',
					category: 'scheduled',
					endOfView: hoursFromNow(18),
					partner: MOCK_PARTNER_A as unknown as UserProfile,
					untilNext: null,
					connectionId: 'conn-3a',
					matchedAt: dayUtils.create().subtract(2, 'hour').toISOString(),
				} as MatchDetailsV31,
				secondary: {
					id: 'match-3b',
					type: 'open',
					category: 'rematch',
					endOfView: hoursFromNow(10),
					partner: MOCK_PARTNER_B as unknown as UserProfile,
					untilNext: null,
					connectionId: 'conn-3b',
					matchedAt: dayUtils.create().subtract(5, 'hour').toISOString(),
				} as MatchDetailsV31,
			};

		// ── #4 post21_rematch: 주황 카드 + "리매칭" badge + PeekSheet(정기 파트너 미니프로필) ──
		case 4:
			return {
				primary: {
					id: 'match-4a',
					type: 'open',
					category: 'rematch',
					endOfView: hoursFromNow(10),
					partner: MOCK_PARTNER_B as unknown as UserProfile,
					untilNext: null,
					connectionId: 'conn-4a',
					matchedAt: dayUtils.create().subtract(1, 'hour').toISOString(),
				} as MatchDetailsV31,
				secondary: {
					id: 'match-4b',
					type: 'open',
					category: 'scheduled',
					endOfView: hoursFromNow(18),
					partner: MOCK_PARTNER_A as unknown as UserProfile,
					untilNext: null,
					connectionId: 'conn-4b',
					matchedAt: dayUtils.create().subtract(3, 'hour').toISOString(),
				} as MatchDetailsV31,
			};

		// ── #5 waiting: 기존 Waiting UI 동일. PeekSheet 없음 ──
		case 5:
			return {
				primary: {
					id: null,
					type: 'waiting',
					category: 'scheduled',
					endOfView: null,
					partner: null,
					untilNext: daysFromNow(3).format('YYYY-MM-DD 21:00:00'),
					connectionId: null,
				} as MatchDetailsV31,
			};

		// ── #6 pending: 기존 PendingApproval UI 동일 ──
		case 6:
			return {
				primary: {
					id: null,
					type: 'pending-approval',
					category: 'scheduled',
					endOfView: null,
					partner: null,
					untilNext: hoursFromNow(2).format('YYYY-MM-DD HH:mm:ss'),
					connectionId: null,
					approvalStatus: 'pending',
					approvalMessage: '프로필 심사 진행 중입니다.',
					estimatedApprovalTime: '2시간',
				} as MatchDetailsV31,
			};

		// ── #7 no_pool: 매칭풀 부족으로 매칭 실패 ──
		case 7:
			return {
				primary: {
					id: null,
					type: 'not-found',
					category: 'scheduled',
					endOfView: null,
					partner: null,
					untilNext: daysFromNow(2).format('YYYY-MM-DD 21:00:00'),
					connectionId: null,
					failureCode: 'NO_MATCH_POOL',
					failureReason: '현재 매칭 가능한 상대가 없어요. 다음 매칭에서 만나요!',
				} as MatchDetailsV31,
			};

		// ── #8 filtered: 필터 조건에 의해 모두 제외됨 ──
		case 8:
			return {
				primary: {
					id: null,
					type: 'not-found',
					category: 'scheduled',
					endOfView: null,
					partner: null,
					untilNext: daysFromNow(2).format('YYYY-MM-DD 21:00:00'),
					connectionId: null,
					failureCode: 'FILTERED_OUT',
					failureReason: '매칭 필터 조건에 맞는 상대가 없어요. 필터를 조정해 보세요.',
				} as MatchDetailsV31,
			};

		// ── #9 already: 이미 매칭된 상대만 남음 ──
		case 9:
			return {
				primary: {
					id: null,
					type: 'not-found',
					category: 'scheduled',
					endOfView: null,
					partner: null,
					untilNext: daysFromNow(2).format('YYYY-MM-DD 21:00:00'),
					connectionId: null,
					failureCode: 'ALREADY_MATCHED',
					failureReason: '이미 매칭된 상대뿐이에요. 새로운 유저가 들어오면 알려드릴게요!',
				} as MatchDetailsV31,
			};
	}
};

export type { ScenarioId };
export { buildScenario };
