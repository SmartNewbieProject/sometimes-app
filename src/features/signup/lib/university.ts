import type { RegionCode } from '@/src/shared/constants/region';
import type { UniversityCard } from '../queries/use-universities';

export const regionCodeMap: Partial<Record<RegionCode, UIRegion>> = {
	BSN: '부산',
	DJN: '대전',
	GHE: '김해',
};

export type UIRegion = '부산' | '대전' | '김해';

export const getRegionsByRegionCode = (code: RegionCode) => {
	return regionCodeMap[code];
};

export type UniversityType = '국립' | '사립' | '과학기술원' | '알 수 없음';

export function getUniversityType(name: string): UniversityType {
	const nationalUniversities = [
		'국립부경대학교',
		'국립한국해양대학교',
		'부산교육대학교',
		'부산대학교',
		'한국방송통신대학교',
		'충남대학교',
		'한밭대학교',
	];

	const privateUniversities = [
		'부산여자대학교',
		'부산경상대학교',
		'부산과학기술대학교',
		'부산보건대학교',
		'부산예술대학교',
		'한국폴리텍 VII 대학 부산캠퍼스',
		'한국폴리텍 VII 대학 동부산캠퍼스',
		'경남정보대학교',
		'김해대학교',
		'동원과학기술대학교',
		'가야대학교',
		'대동대학교',
		'동의과학대학교',
		'경성대학교',
		'고신대학교',
		'동명대학교',
		'동서대학교',
		'동아대학교',
		'동의대학교',
		'부산가톨릭대학교',
		'부산외국어대학교',
		'신라대학교',
		'영산대학교',
		'동주대학교',
		'건양대학교',
		'대전대학교',
		'목원대학교',
		'배재대학교',
		'우송대학교',
		'한남대학교',
		'을지대학교',
		'대전보건대학교',
		'인제대학교',
	];

	const ISTUniversities = ['KAIST'];

	if (nationalUniversities?.includes(name)) return '국립';
	if (privateUniversities?.includes(name)) return '사립';
	if (ISTUniversities?.includes(name)) return '과학기술원';
	return '알 수 없음';
}

export function getUniversityLogoFolderName(region: RegionCode) {
	switch (region) {
		case 'DJN':
			return 'daejeon';
		case 'BSN':
		case 'GHE':
			return 'busan';
		default:
			return '';
	}
}

export function filterUniversities(universities: UniversityCard[], searchText: string) {
	const lowerText = searchText.toLowerCase();

	return (
		universities?.filter(({ name, area, region, universityType }) => {
			return (
				name.toLowerCase().includes(lowerText) ||
				(area?.toLowerCase?.().includes(lowerText) ?? false) ||
				region.toLowerCase().includes(lowerText) ||
				universityType.toLowerCase().includes(lowerText)
			);
		}) ?? []
	);
}
