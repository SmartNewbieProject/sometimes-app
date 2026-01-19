import { useQuery, useQueries } from '@tanstack/react-query';
import { axiosClient } from '@shared/libs';
import { useAuth } from '@features/auth/hooks';

interface EventStatus {
	eventType: string;
	expiredAt: string | null;
	currentAttempt: number;
	maxAttempt: number;
}

interface UniversityVerificationStatus {
	profileId: string;
	verifiedAt: string | null;
}

type MissionStatus = 'pending' | 'claimable' | 'completed';

interface GemMission {
	id: string;
	titleKey: string;
	reward: number;
	status: MissionStatus;
	navigateTo?: string;
}

const GEM_MISSION_QUERY_KEYS = {
	instagramRegistration: ['gem-mission', 'instagram-registration'] as const,
	communityFirstPost: ['gem-mission', 'community-first-post'] as const,
	universityVerification: (profileId: string) =>
		['gem-mission', 'university-verification', profileId] as const,
	all: ['gem-mission', 'all'] as const,
};

const fetchInstagramRegistration = (): Promise<EventStatus> =>
	axiosClient.get('/v1/event/INSTAGRAM_REGISTRATION');

const fetchCommunityFirstPost = (): Promise<EventStatus> =>
	axiosClient.get('/v1/event/COMMUNITY_FIRST_POST');

const fetchUniversityVerification = (profileId: string): Promise<UniversityVerificationStatus> =>
	axiosClient.get(`/profile/university-verification/${profileId}`);

export const useInstagramRegistrationQuery = () =>
	useQuery({
		queryKey: GEM_MISSION_QUERY_KEYS.instagramRegistration,
		queryFn: fetchInstagramRegistration,
		staleTime: 1000 * 60 * 5,
	});

export const useCommunityFirstPostQuery = () =>
	useQuery({
		queryKey: GEM_MISSION_QUERY_KEYS.communityFirstPost,
		queryFn: fetchCommunityFirstPost,
		staleTime: 1000 * 60 * 5,
	});

export const useUniversityVerificationQuery = (profileId: string | null) =>
	useQuery({
		queryKey: GEM_MISSION_QUERY_KEYS.universityVerification(profileId!),
		queryFn: () => fetchUniversityVerification(profileId!),
		enabled: !!profileId,
		staleTime: 1000 * 60 * 5,
	});

const determineMissionStatus = (isCompleted: boolean): MissionStatus => {
	if (isCompleted) return 'completed';
	return 'pending';
};

export const useGemMissions = () => {
	const { my } = useAuth();
	const profileId = my?.id;

	const queries = useQueries({
		queries: [
			{
				queryKey: GEM_MISSION_QUERY_KEYS.instagramRegistration,
				queryFn: fetchInstagramRegistration,
				staleTime: 1000 * 60 * 5,
			},
			{
				queryKey: GEM_MISSION_QUERY_KEYS.communityFirstPost,
				queryFn: fetchCommunityFirstPost,
				staleTime: 1000 * 60 * 5,
			},
			{
				queryKey: GEM_MISSION_QUERY_KEYS.universityVerification(profileId ?? ''),
				queryFn: () => fetchUniversityVerification(profileId!),
				enabled: !!profileId,
				staleTime: 1000 * 60 * 5,
			},
		],
	});

	const [instagramQuery, communityQuery, universityQuery] = queries;

	const isLoading = queries.some((q) => q.isLoading);
	const isError = queries.some((q) => q.isError);

	const missions: GemMission[] = [
		{
			id: 'instagram-registration',
			titleKey: 'features.payment.ui.gem_mission.missions.instagram_verification',
			reward: 10,
			status: determineMissionStatus((instagramQuery.data?.currentAttempt ?? 0) > 0),
			navigateTo: '/instagram/verify?referrer=home',
		},
		{
			id: 'community-first-post',
			titleKey: 'features.payment.ui.gem_mission.missions.community_first_post',
			reward: 10,
			status: determineMissionStatus((communityQuery.data?.currentAttempt ?? 0) > 0),
			navigateTo: '/community',
		},
		{
			id: 'university-verification',
			titleKey: 'features.payment.ui.gem_mission.missions.university_verification',
			reward: 20,
			status: determineMissionStatus(!!universityQuery.data?.verifiedAt),
			navigateTo: '/university-verification',
		},
	];

	const completedCount = missions.filter((m) => m.status === 'completed').length;
	const totalReward = missions
		.filter((m) => m.status === 'completed')
		.reduce((sum, m) => sum + m.reward, 0);

	return {
		missions,
		isLoading,
		isError,
		completedCount,
		totalCount: missions.length,
		totalReward,
		refetch: () => queries.forEach((q) => q.refetch()),
	};
};
