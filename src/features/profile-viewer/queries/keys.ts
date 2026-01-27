export const PROFILE_VIEWER_KEYS = {
	all: ['profile-viewer'] as const,
	lists: () => [...PROFILE_VIEWER_KEYS.all, 'list'] as const,
	list: (params?: { page?: number; limit?: number }) =>
		[...PROFILE_VIEWER_KEYS.lists(), params] as const,
	counts: () => [...PROFILE_VIEWER_KEYS.all, 'counts'] as const,
	cost: () => [...PROFILE_VIEWER_KEYS.all, 'cost'] as const,
	homeSummary: () => [...PROFILE_VIEWER_KEYS.all, 'home-summary'] as const,
} as const;
