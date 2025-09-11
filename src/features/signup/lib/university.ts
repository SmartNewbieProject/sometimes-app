import type { RegionCode } from '@/src/shared/constants/region';
import type { UniversityCard } from '../queries/use-universities';
export const regionCodeMap: Partial<Record<RegionCode, UIRegion>> = {
	BSN: '부산',
	DJN: '대전',
	GHE: '김해',
	DGU: '대구',
	CJU: '청주',
	SJG: '세종',
	CAN: '천안',
	ICN: '인천',
	SEL: '서울',
	KYG: '경기',
	GWJ: '광주',
};
export type UIRegion =
	| '부산'
	| '대전'
	| '김해'
	| '대구'
	| '세종'
	| '청주'
	| '천안'
	| '인천'
	| '서울'
	| '광주'
	| '경기';
export const getRegionsByRegionCode = (code: RegionCode): string | undefined => {
	return regionCodeMap[code];
};
export type UniversityType = '국립' | '사립' | '과학기술원' | '도립' | '알 수 없음';
export function getUniversityType(name: string): UniversityType {
	const nationalUniversities = [
		'국립부경대학교',
		'국립한국해양대학교',
		'부산교육대학교',
		'부산대학교',
		'한국방송통신대학교',
		'충남대학교',
		'한국폴리텍',
		'한밭대학교',
		'한국폴리텍 VII 대학 부산캠퍼스',
		'한국폴리텍 VII 대학 동부산캠퍼스',
		'한국폴리텍대학교 구미캠퍼스',
		'한국폴리텍대학교 대구캠퍼스',
		'한국폴리텍대학교 영남융합기술캠퍼스',
		'한국폴리텍대학교 영주캠퍼스',
		'한국폴리텍대학교 청주캠퍼스',
		'경북대학교',
		'금오공과대학교',
		'대구교육대학교',
		'충북대학교',
		'청주교육대학교',
		'한국교원대학교',
		'공주교육대학교',
		'공주대학교',
		'국립공주대학교',
		'한국폴리텍 IV 대학 아산캠퍼스',
		'경인교육대학교',
		'인천대학교',
		'한국폴리텍 II 대학 인천캠퍼스',
	];
	const provincialUniversities = ['충북도립대학교'];
	const privateUniversities = [
		'부산여자대학교',
		'부산경상대학교',
		'부산과학기술대학교',
		'부산보건대학교',
		'부산예술대학교',
		'고려대학교 세종캠퍼스',
		'홍익대학교 세종캠퍼스',
		'꽃동네대학교',
		'서원대학교',
		'충북보건과학대학교',
		'충청대학교',
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
		'우송정보대',
		'대전신학대학교',
		'중부대학교',
		'한국침례신학대학교',
		'대덕대학교',
		'금강대학교',
		'대전과학기술대학교',
		'경북과학대학교',
		'경북보건대학교',
		'경일대학교',
		'계명대학교',
		'계명문화대학교',
		'구미대학교',
		'김천대학교',
		'대경대학교',
		'대구가톨릭대학교',
		'대구공업대학교',
		'대구과학대학교',
		'대구대학교',
		'대구보건대학교',
		'대구예술대학교',
		'대구한의대학교',
		'대신대학교',
		'수성대학교',
		'영남대학교',
		'영남신학대학교',
		'영남외국어대학교',
		'영남이공대학교',
		'영진전문대학교',
		'호산대학교',
		'경운대학교',
		'한국기술교육대학교',
		'연암대학교',
		'나사렛대학교',
		'남서울대학교',
		'단국대학교',
		'백석대학교',
		'상명대학교',
		'순천향대학교',
		'유원대학교',
		'호서대학교',
		'가천대학교',
		'안양대학교',
		'인천가톨릭대학교',
		'인하대학교',
		'청운대학교',
		'경인여자대학교',
		'인하공업전문대학',
		'재능대학교',
		'한국공학대학교',
		'연세대학교국제캠퍼스',
	];
	const ISTUniversities = ['KAIST', '대구경북과학기술원'];
	if (nationalUniversities?.includes(name)) return '국립';
	if (privateUniversities?.includes(name)) return '사립';
	if (provincialUniversities?.includes(name)) return '도립';
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
		case 'DGU':
			return 'daegu';
		case 'CJU':
		case 'SJG':
			return 'chungcheong';
		case 'ICN':
			return 'incheon';
		case 'CAN':
			return 'cheonan';
		case 'SEL':
			return 'seoul';
		case 'KYG':
			return 'gyeonggi';
		case 'GWJ':
			return 'gwangju';
		default:
			return '';
	}
}
export function filterUniversities(universities: UniversityCard[], searchText: string) {
	const lowerText = searchText.toLowerCase();
	return (
		universities?.filter(({ name, area, region, en }) => {
			return (
				name.toLowerCase().includes(lowerText) ||
				(area?.toLowerCase?.().includes(lowerText) ?? false)
			);
		}) ?? []
	);
}
