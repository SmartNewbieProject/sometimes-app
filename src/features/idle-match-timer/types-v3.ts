import type { Dayjs } from 'dayjs';

export type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching';

export interface UniversityV3 {
	department: string;
	name: string;
	grade: string;
	studentNumber: string;
}

export interface PreferenceV3 {
	typeName: string;
	options: string[];
}

export interface PartnerV3 {
	id: string;
	name: string;
	age: number;
	gender: 'male' | 'female';
	instagramId: string;
	university: UniversityV3;
	preferences: PreferenceV3[];
}

export interface ProcessStep {
	step: string;
	stepName: string;
	candidatesBefore: number;
	candidatesAfter: number;
	filteredCount: number;
	durationMs: number;
}

export interface MatchingSummary {
	processSteps: ProcessStep[];
	totalDurationMs: number;
}

export interface Reasons {
	summary: string;
	detailedReasons: string[];
	aiDescription: string;
}

export interface CompatibilityBreakdown {
	similarityScore: number;
	demographics: Record<string, unknown>;
	interests: Record<string, unknown>;
}

export interface RematchResponseV3 {
	id: string | null;
	type: MatchViewType;
	endOfView: string;
	partner: PartnerV3 | null;
	untilNext: string;
	connectionId: string | null;
	matchingSummary: MatchingSummary;
	reasons: Reasons;
	compatibilityBreakdown: CompatibilityBreakdown;
}

export interface MatchDetailsV3 {
	id: string | null;
	type: MatchViewType;
	endOfView: Dayjs | null;
	partner: PartnerV3 | null;
	untilNext: string | null;
	connectionId: string | null;
	matchingSummary: MatchingSummary;
	reasons: Reasons;
	compatibilityBreakdown: CompatibilityBreakdown;
}

export interface ServerMatchDetailsV3 extends Omit<MatchDetailsV3, 'endOfView'> {
	endOfView: string | null;
}

export type OpenMatchV3 = MatchDetailsV3 & {
	type: 'open' | 'rematching';
	partner: PartnerV3;
	endOfView: Dayjs;
	id: string;
	connectionId: string;
};

export type WaitingMatchV3 = MatchDetailsV3 & {
	type: 'waiting';
	untilNext: string;
};

export type NotFoundMatchV3 = MatchDetailsV3 & {
	type: 'not-found';
	untilNext: string;
};

export const isOpenMatchV3 = (match: MatchDetailsV3): match is OpenMatchV3 =>
	(match.type === 'open' || match.type === 'rematching') &&
	match.partner !== null &&
	match.endOfView !== null;

export const isWaitingMatchV3 = (match: MatchDetailsV3): match is WaitingMatchV3 =>
	match.type === 'waiting' && match.untilNext !== null;

export const isNotFoundMatchV3 = (match: MatchDetailsV3): match is NotFoundMatchV3 =>
	match.type === 'not-found' && match.untilNext !== null;
