export enum RegionCode {
	SEL = 'SEL', // 서울특별시
	BSN = 'BSN', // 부산광역시
	DGU = 'DGU', // 대구광역시
	ICN = 'ICN', // 인천광역시
	GWJ = 'GWJ', // 광주광역시
	DJN = 'DJN', // 대전광역시
	ULS = 'ULS', // 울산광역시
	SJG = 'SJG', // 세종특별자치시
	SWN = 'SWN', // 수원시
	YGN = 'YGN', // 용인시
	SGN = 'SGN', // 성남시
	AYG = 'AYG', // 안양시
	ASN = 'ASN', // 안산시
	BCN = 'BCN', // 부천시
	GYG = 'GYG', // 고양시
	GJU = 'GJU', // 광주시
	HWS = 'HWS', // 화성시
	PTK = 'PTK', // 평택시
	UJB = 'UJB', // 의정부시
	ICH = 'ICH', // 이천시
	POC = 'POC', // 포천시
	ANG = 'ANG', // 안성시
	OSN = 'OSN', // 오산시
	YJU = 'YJU', // 양주시
	CCN = 'CCN', // 춘천시
	WJU = 'WJU', // 원주시
	GNG = 'GNG', // 강릉시
	SCO = 'SCO', // 속초시
	SCK = 'SCK', // 삼척시
	CJU = 'CJU', // 청주시
	CGJ = 'CGJ', // 충주시
	JCN = 'JCN', // 제천시
	CA = 'CA', // 천안시
	GJJ = 'GJJ', // 공주시
	ASA = 'ASA', // 아산시
	SSN = 'SSN', // 서산시
	NSN = 'NSN', // 논산시
	BRY = 'BRY', // 보령시
	JJU = 'JJU', // 전주시
	GSN = 'GSN', // 군산시
	IKS = 'IKS', // 익산시
	JEU = 'JEU', // 정읍시
	NWN = 'NWN', // 남원시
	YSU = 'YSU', // 여수시
	SCH = 'SCH', // 순천시
	MKP = 'MKP', // 목포시
	GYY = 'GYY', // 광양시
	NJU = 'NJU', // 나주시
	PHG = 'PHG', // 포항시
	GMI = 'GMI', // 구미시
	GJO = 'GJO', // 경주시
	ADG = 'ADG', // 안동시
	GCN = 'GCN', // 김천시
	GSA = 'GSA', // 경산시
	YJA = 'YJA', // 영주시
	SJU = 'SJU', // 상주시
	YCN = 'YCN', // 영천시
	MGY = 'MGY', // 문경시
	CWN = 'CWN', // 창원시
	JJE = 'JJE', // 진주시
	GHE = 'GHE', // 김해시
	YSN = 'YSN', // 양산시
	GJE = 'GJE', // 거제시
	TYG = 'TYG', // 통영시
	SCN = 'SCN', // 사천시
	MYG = 'MYG', // 밀양시
	JJA = 'JJA', // 제주시
	SGP = 'SGP', // 서귀포시
}

export type KoreanRegionName =
	| '서울특별시'
	| '부산광역시'
	| '대구광역시'
	| '인천광역시'
	| '광주광역시'
	| '대전광역시'
	| '울산광역시'
	| '세종특별자치시'
	| '수원시'
	| '용인시'
	| '성남시'
	| '안양시'
	| '안산시'
	| '부천시'
	| '고양시'
	| '광주시'
	| '화성시'
	| '평택시'
	| '의정부시'
	| '이천시'
	| '포천시'
	| '안성시'
	| '오산시'
	| '양주시'
	| '춘천시'
	| '원주시'
	| '강릉시'
	| '속초시'
	| '삼척시'
	| '청주시'
	| '충주시'
	| '제천시'
	| '천안시'
	| '공주시'
	| '아산시'
	| '서산시'
	| '논산시'
	| '보령시'
	| '전주시'
	| '군산시'
	| '익산시'
	| '정읍시'
	| '남원시'
	| '여수시'
	| '순천시'
	| '목포시'
	| '광양시'
	| '나주시'
	| '포항시'
	| '구미시'
	| '경주시'
	| '안동시'
	| '김천시'
	| '경산시'
	| '영주시'
	| '상주시'
	| '영천시'
	| '문경시'
	| '창원시'
	| '진주시'
	| '김해시'
	| '양산시'
	| '거제시'
	| '통영시'
	| '사천시'
	| '밀양시'
	| '제주시'
	| '서귀포시';

const regionMap: Record<KoreanRegionName, RegionCode> = {
	서울특별시: RegionCode.SEL,
	부산광역시: RegionCode.BSN,
	대구광역시: RegionCode.DGU,
	인천광역시: RegionCode.ICN,
	광주광역시: RegionCode.GWJ,
	대전광역시: RegionCode.DJN,
	울산광역시: RegionCode.ULS,
	세종특별자치시: RegionCode.SJG,
	수원시: RegionCode.SWN,
	용인시: RegionCode.YGN,
	성남시: RegionCode.SGN,
	안양시: RegionCode.AYG,
	안산시: RegionCode.ASN,
	부천시: RegionCode.BCN,
	고양시: RegionCode.GYG,
	광주시: RegionCode.GJU,
	화성시: RegionCode.HWS,
	평택시: RegionCode.PTK,
	의정부시: RegionCode.UJB,
	이천시: RegionCode.ICH,
	포천시: RegionCode.POC,
	안성시: RegionCode.ANG,
	오산시: RegionCode.OSN,
	양주시: RegionCode.YJU,
	춘천시: RegionCode.CCN,
	원주시: RegionCode.WJU,
	강릉시: RegionCode.GNG,
	속초시: RegionCode.SCO,
	삼척시: RegionCode.SCK,
	청주시: RegionCode.CJU,
	충주시: RegionCode.CGJ,
	제천시: RegionCode.JCN,
	천안시: RegionCode.CA,
	공주시: RegionCode.GJJ,
	아산시: RegionCode.ASA,
	서산시: RegionCode.SSN,
	논산시: RegionCode.NSN,
	보령시: RegionCode.BRY,
	전주시: RegionCode.JJU,
	군산시: RegionCode.GSN,
	익산시: RegionCode.IKS,
	정읍시: RegionCode.JEU,
	남원시: RegionCode.NWN,
	여수시: RegionCode.YSU,
	순천시: RegionCode.SCH,
	목포시: RegionCode.MKP,
	광양시: RegionCode.GYY,
	나주시: RegionCode.NJU,
	포항시: RegionCode.PHG,
	구미시: RegionCode.GMI,
	경주시: RegionCode.GJO,
	안동시: RegionCode.ADG,
	김천시: RegionCode.GCN,
	경산시: RegionCode.GSA,
	영주시: RegionCode.YJA,
	상주시: RegionCode.SJU,
	영천시: RegionCode.YCN,
	문경시: RegionCode.MGY,
	창원시: RegionCode.CWN,
	진주시: RegionCode.JJE,
	김해시: RegionCode.GHE,
	양산시: RegionCode.YSN,
	거제시: RegionCode.GJE,
	통영시: RegionCode.TYG,
	사천시: RegionCode.SCN,
	밀양시: RegionCode.MYG,
	제주시: RegionCode.JJA,
	서귀포시: RegionCode.SGP,
};

export function getRegionCodeByName(name: KoreanRegionName): RegionCode {
	return regionMap[name];
}
