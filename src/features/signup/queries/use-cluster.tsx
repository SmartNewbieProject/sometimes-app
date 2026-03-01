import { getSmartUnivLogoUrl } from '@/src/shared/libs';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getClusterByRegion } from '../apis';

export function useClusterQuery(regionCode: string) {
	const { i18n } = useTranslation();
	const country = i18n.language?.startsWith('ja') ? 'jp' : 'kr';

	const { data, isLoading } = useQuery({
		queryKey: ['universities', 'cluster', regionCode],
		queryFn: () => getClusterByRegion(regionCode),
		enabled: regionCode.length > 0,
		staleTime: 1000 * 60 * 10,
	});

	const universities = data?.universities?.map((item) => ({
		...item,
		logoUrl: getSmartUnivLogoUrl(item.code, country),
		universityType: item.foundation,
	}));

	return {
		cluster: data?.cluster ?? null,
		universities: universities ?? [],
		isLoading,
	};
}
