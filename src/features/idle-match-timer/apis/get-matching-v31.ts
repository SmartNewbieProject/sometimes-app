import { axiosClient, dayUtils } from '@/src/shared/libs';
import { devLogWithTag } from '@/src/shared/utils';
import type {
	MatchComposite,
	MatchCompositeResponse,
	MatchDetailsV31,
	ServerMatchDetailsV31,
} from '../types-v31';

const transformMatch = (data: ServerMatchDetailsV31): MatchDetailsV31 => ({
	...data,
	endOfView: data.endOfView ? dayUtils.create(data.endOfView) : null,
});

export const getLatestMatchingV31 = async (): Promise<MatchComposite> => {
	const result = (await axiosClient.get('/v3/matching')) as unknown as MatchCompositeResponse;

	devLogWithTag('API v3.1', 'Matching composite:', {
		primaryId: result.primary?.id,
		primaryType: result.primary?.type,
		primaryCategory: result.primary?.category,
		hasSecondary: !!result.secondary,
		secondaryType: result.secondary?.type,
		secondaryCategory: result.secondary?.category,
	});

	return {
		primary: transformMatch(result.primary),
		secondary: result.secondary ? transformMatch(result.secondary) : undefined,
	};
};
