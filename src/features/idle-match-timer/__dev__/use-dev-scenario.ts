/**
 * Dev 시나리오 스토어
 *
 * __DEV__ 환경에서만 동작. 프로덕션 빌드에서는 항상 null 반환.
 *
 * 사용:
 *   useDevScenario.getState().setScenario(3)   // 시나리오 #3 활성화
 *   useDevScenario.getState().setScenario(null) // 실제 API 복원
 */
import { create } from 'zustand';
import type { MatchComposite } from '../types-v31';
import { type ScenarioId, buildScenario } from './scenarios';

type DevScenarioState = {
	activeScenario: ScenarioId | null;
	setScenario: (id: ScenarioId | null) => void;
	getMockData: () => MatchComposite | null;
};

export const useDevScenario = create<DevScenarioState>((set, get) => ({
	activeScenario: null,
	setScenario: (id) => set({ activeScenario: id }),
	getMockData: () => {
		const { activeScenario } = get();
		if (!__DEV__ || activeScenario === null) return null;
		return buildScenario(activeScenario);
	},
}));
