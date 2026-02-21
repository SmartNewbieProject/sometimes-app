export const globalMatchingKeys = {
	all: ['global-matching'] as const,
	matching: () => [...globalMatchingKeys.all, 'matching'] as const,
	status: () => [...globalMatchingKeys.all, 'status'] as const,
	preferenceOptions: () => [...globalMatchingKeys.all, 'preference-options'] as const,
};
