import type { UserProfile } from '@/src/types/user';
import type { Dayjs } from 'dayjs';

export type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching' | 'pending-approval';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export enum UserRejectionCategory {
  INAPPROPRIATE_PROFILE_IMAGE = 'INAPPROPRIATE_PROFILE_IMAGE',
  FALSE_INFORMATION = 'FALSE_INFORMATION',
  TERMS_VIOLATION = 'TERMS_VIOLATION',
  OTHER = 'OTHER',
}

export type MatchDetails = {
	id: string | null;
	type: MatchViewType;
	endOfView: Dayjs | null;
	partner: UserProfile | null;
	untilNext: string | null;
	connectionId: string | null;
	approvalStatus?: ApprovalStatus;
	approvalMessage?: string;
	estimatedApprovalTime?: string;
	rejectionCategory?: UserRejectionCategory;
	rejectionReason?: string;
};

export type ServerMatchDetails = Omit<MatchDetails, 'endOfView'> & {
	endOfView: string | null;
	approvalStatus?: ApprovalStatus;
	approvalMessage?: string;
	estimatedApprovalTime?: string;
	rejectionCategory?: UserRejectionCategory;
	rejectionReason?: string;
};

export type OpenMatch = MatchDetails & {
	type: 'open' | 'rematching';
	partner: UserProfile;
	endOfView: Dayjs;
	id: string;
	connectionId: string;
};

export type WaitingMatch = MatchDetails & {
	type: 'waiting';
	untilNext: string;
};

export type NotFoundMatch = MatchDetails & {
	type: 'not-found';
	untilNext: string;
};

export const isOpenMatch = (match: MatchDetails): match is OpenMatch =>
	(match.type === 'open' || match.type === 'rematching') &&
	match.partner !== null &&
	match.endOfView !== null;

export const isWaitingMatch = (match: MatchDetails): match is WaitingMatch =>
	match.type === 'waiting' && match.untilNext !== null;

export const isNotFoundMatch = (match: MatchDetails): match is NotFoundMatch =>
	match.type === 'not-found' && match.untilNext !== null;

export type PendingApprovalMatch = MatchDetails & {
	type: 'pending-approval';
	untilNext: string;
	approvalStatus: ApprovalStatus;
};

export const isPendingApprovalMatch = (match: MatchDetails): match is PendingApprovalMatch =>
	match.type === 'pending-approval' && match.untilNext !== null;
