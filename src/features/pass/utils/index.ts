import { PassAuthRequest, PassConfig } from '../types';
import i18n from '@/src/shared/libs/i18n';

/**
 * PASS 본인인증 요청 URL을 생성합니다
 */
export const generatePassAuthUrl = (
	config: PassConfig,
	options: Omit<PassAuthRequest, 'siteCd' | 'siteUrl' | 'cpCd'>,
): string => {
	const baseUrl = config.isTestMode
		? 'https://testcert.kcp.co.kr/kcp_cert/cert_view.jsp'
		: 'https://cert.kcp.co.kr/kcp_cert/cert_view.jsp';

	const params = new URLSearchParams({
		site_cd: config.siteCd,
		site_url: config.siteUrl,
		cp_cd: config.cpCd,
		popup_yn: config.popupYn || 'N',
		...options,
	});

	return `${baseUrl}?${params.toString()}`;
};

/**
 * PASS 인증 결과 URL에서 파라미터를 파싱합니다
 */
export const parsePassAuthResponse = (url: string) => {
	try {
		const urlObj = new URL(url);
		const params = new URLSearchParams(urlObj.search);

		return {
			ordr_idxx: params.get('ordr_idxx') || '',
			res_cd: params.get('res_cd') || '',
			res_msg: params.get('res_msg') || '',
			cert_no: params.get('cert_no') || '',
			cert_date: params.get('cert_date') || '',
			cert_txseq: params.get('cert_txseq') || '',
			phone_no: params.get('phone_no') || undefined,
			birth_day: params.get('birth_day') || undefined,
			sex_code: params.get('sex_code') || undefined,
			ci: params.get('ci') || undefined,
			di: params.get('di') || undefined,
			name: params.get('name') || undefined,
			local_code: params.get('local_code') || undefined,
			nation_code: params.get('nation_code') || undefined,
			up_hash: params.get('up_hash') || undefined,
		};
	} catch (error) {
		throw new Error(`Failed to parse PASS auth response: ${error}`);
	}
};

/**
 * 인증 번호를 생성합니다 (타임스탬프 + 랜덤 번호)
 */
export const generateCertNum = (): string => {
	const timestamp = Date.now().toString();
	const random = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0');
	return `${timestamp}${random}`;
};

/**
 * PASS 응답 코드가 성공인지 확인합니다
 */
export const isPassAuthSuccess = (resCode: string): boolean => {
	return resCode === '0000';
};

/**
 * PASS 에러 메시지를 변환합니다
 */
export const getPassErrorMessage = (resCode: string, resMsg: string): string => {
	const errorMessages: Record<string, string> = {
		'0001': i18n.t('common.인증_실패'),
		'0002': i18n.t('common.인증_취소'),
		'0003': i18n.t('common.인증_시간_초과'),
		'9999': i18n.t('common.시스템_오류'),
	};

	return errorMessages[resCode] || resMsg || i18n.t('common.알_수_없는_오류가_발생했습니다');
};

/**
 * 휴대폰 번호 포맷팅
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
	const cleaned = phoneNumber.replace(/\D/g, '');

	if (cleaned.length === 11) {
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
	} else if (cleaned.length === 10) {
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
	}

	return phoneNumber;
};

/**
 * 생년월일 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
 */
export const formatBirthDate = (birthDate: string): string => {
	if (birthDate.length === 8) {
		return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
	}
	return birthDate;
};

/**
 * 생년월일로부터 만나이 계산
 * @param birthDate YYYY-MM-DD 형식의 생년월일
 * @returns 만나이
 */
export const calculateAge = (birthDate: string): number => {
	const today = new Date();
	const birth = new Date(birthDate);

	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--;
	}

	return age;
};

/**
 * 가입 가능한 연령인지 확인 (만 18세 이상 27세 이하)
 * @param birthDate YYYY-MM-DD 형식의 생년월일
 * @returns 만 18세 이상 27세 이하이면 true, 그 외는 false
 */
export const isAdult = (birthDate: string): boolean => {
	const age = calculateAge(birthDate);
	return age >= 18 && age <= 27;
};
