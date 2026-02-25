import { axiosClient, dayUtils, fileUtils, platform } from '@/src/shared/libs';
import { nanoid } from 'nanoid';
import type { AppleLoginResponse } from '../queries/use-apple-login';
import type { UniversitiesByRegion } from '../queries/use-universities';
import type { AuthorizeSmsCode, SignupForm, SignupResponse } from '../types';

export type { SignupResponse };

// YYYY-MM-DD 형식의 생년월일로부터 만나이 계산
const calculateAge = (birthday: string): number => {
	const today = dayUtils.create();
	const birthDate = dayUtils.create(birthday);
	return today.diff(birthDate, 'year');
};

export interface University {
	id: string;
	name: string;
	code: string;
	region: string;
	type: string;
	en: string | null;
}

export const getUnivs = async (): Promise<University[]> => {
	return axiosClient.get('/universities');
};

export const getTopUniversities = (country?: string): Promise<UniversitiesByRegion> => {
	const params = country ? `?country=${country}` : '';
	return axiosClient.get(`/universities/top${params}`);
};

export const searchUniversities = (
	searchText: string,
	country?: string,
): Promise<UniversitiesByRegion> => {
	const countryParam = country ? `&country=${country}` : '';
	return axiosClient.get(`/universities?name=${encodeURIComponent(searchText)}${countryParam}`);
};

export const getDepartments = async (univ: string): Promise<string[]> => {
	return axiosClient.get(`/universities/departments?universityId=${univ}`);
};

export interface CreateUniversityParams {
	name: string;
	region: string;
}

export interface CreateUniversityResult {
	id: string;
	name: string;
	region: string;
}

export const createUniversity = (
	params: CreateUniversityParams,
): Promise<CreateUniversityResult> => {
	return axiosClient.post('/universities/new', params);
};

export interface CreateDepartmentParams {
	universityId: string;
	name: string;
}

export interface CreateDepartmentResult {
	id: string;
	name: string;
	universityId: string;
}

export const createDepartment = (
	params: CreateDepartmentParams,
): Promise<CreateDepartmentResult> => {
	return axiosClient.post(`/universities/${params.universityId}/departments/new`, {
		name: params.name,
	});
};

export interface RegionItem {
	code: string;
	name: string;
}

export const getRegionsList = (): Promise<RegionItem[]> => {
	return axiosClient.get('/universities/regions/list');
};

export interface SearchDepartmentItem {
	id: string;
	name: string;
	universityId: string;
	universityName: string;
}

export const searchDepartments = (keyword: string): Promise<SearchDepartmentItem[]> => {
	return axiosClient.get(`/universities/departments/search?keyword=${encodeURIComponent(keyword)}`);
};

export interface ClusterRegion {
	code: string;
	name: string;
}

export interface ClusterInfo {
	id: string;
	name: string;
	regions: ClusterRegion[];
}

export interface ClusterUniversity {
	id: string;
	name: string;
	code: string;
	region: string;
	foundation: string;
}

export interface ClusterResponse {
	cluster: ClusterInfo | null;
	universities: ClusterUniversity[];
}

export const getClusterByRegion = (regionCode: string): Promise<ClusterResponse> => {
	return axiosClient.get(`/universities/clusters?regionCode=${encodeURIComponent(regionCode)}`);
};

const createFileObject = (imageUri: string, fileName: string) =>
	platform({
		web: async () => {
			const blob = await fileUtils.dataURLtoBlob(imageUri);
			return fileUtils.toFile(blob, fileName);
		},
		default: () =>
			({
				uri: imageUri,
				name: fileName,
				type: 'image/png',
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			}) as any,
	});

export const checkPhoneNumberExists = (phoneNumber: string): Promise<{ exists: boolean }> =>
	axiosClient.post('/auth/check/phone-number', { phoneNumber });

export const getUniversitiesByRegion = (regions: string[]): Promise<UniversitiesByRegion> => {
	return axiosClient.post('/universities/regions', { regions });
};

export const checkPhoneNumberBlacklist = (
	phoneNumber: string,
): Promise<{ isBlacklisted: boolean }> =>
	axiosClient.post('/auth/check/phone-number/blacklist', { phoneNumber });

export const signup = async (form: SignupForm): Promise<SignupResponse> => {
	const formData = new FormData();
	formData.append('phoneNumber', form.phoneNumber || form.phone);
	formData.append('name', form.name);
	formData.append('birthday', form.birthday);
	formData.append('gender', form.gender);
	const age = calculateAge(form.birthday);
	formData.append('age', age.toString());
	formData.append('universityId', form.universityId);
	formData.append('departmentName', form.departmentName);
	formData.append('instagramId', form.instagramId);
	if (form.kakaoId) {
		formData.append('kakaoId', form.kakaoId);
	}
	if (form.appleId) {
		formData.append('appleId', form.appleId);
	}

	if (form?.referralCode && form.referralCode !== '') {
		formData.append('referralCode', form.referralCode);
	}

	if (form.idealTypeTestSessionId) {
		formData.append('idealTypeTestSessionId', form.idealTypeTestSessionId);
	}

	if (form.country) {
		formData.append('country', form.country);
	}

	if (form.profileImages && form.profileImages.length > 0) {
		const filePromises = form.profileImages.map((imageUri) =>
			createFileObject(imageUri, `${form.name}-${nanoid(6)}.png`),
		);
		const files = await Promise.all(filePromises);
		for (const file of files) {
			formData.append('profileImages', file);
		}
		formData.append('mainImageIndex', '0');
	}

	const headers: Record<string, string> = {
		'Content-Type': 'multipart/form-data',
	};

	if (form.country) {
		headers['X-Country'] = form.country.toLowerCase();
	}

	return axiosClient.post('/auth/signup', formData, { headers });
};

const authenticateSmsCode = (smsCode: AuthorizeSmsCode): Promise<void> =>
	axiosClient.patch('/auth/sms', smsCode);

type Service = {
	getUnivs: () => Promise<University[]>;
	getDepartments: (univ: string) => Promise<string[]>;
	checkPhoneNumberExists: (phoneNumber: string) => Promise<{ exists: boolean }>;
	checkPhoneNumberBlacklist: (phoneNumber: string) => Promise<{ isBlacklisted: boolean }>;
	signup: (form: SignupForm) => Promise<SignupResponse>;
	sendVerificationCode: (phoneNumber: string) => Promise<{ uniqueKey: string }>;
	authenticateSmsCode: (smsCode: AuthorizeSmsCode) => Promise<void>;
	postAppleLogin: (params: AppleLoginRequest) => Promise<AppleLoginResponse>;
};

const sendVerificationCode = (phoneNumber: string): Promise<{ uniqueKey: string }> =>
	axiosClient.post('/auth/sms/send', { phoneNumber });

export interface AppleLoginRequest {
	appleId: string;
	phoneNumber?: string;
}

const postAppleLogin = (params: AppleLoginRequest): Promise<AppleLoginResponse> => {
	const body: AppleLoginRequest = { appleId: params.appleId };
	if (params.phoneNumber) {
		body.phoneNumber = params.phoneNumber.replace(/-/g, '');
	}
	return axiosClient.post('/auth/oauth/apple', body);
};

const apis: Service = {
	getUnivs,
	getDepartments,
	checkPhoneNumberExists,
	checkPhoneNumberBlacklist,
	signup,
	sendVerificationCode,
	authenticateSmsCode,
	postAppleLogin,
};

export default apis;
