import type { AuthorizeSmsCode } from '@/app/auth/signup/types';
import { axiosClient, dayUtils, fileUtils, platform } from '@/src/shared/libs';
import { nanoid } from 'nanoid';
import type { SignupForm } from '../hooks';

export const getUnivs = async (): Promise<string[]> => {
	return axiosClient.get('/universities');
};

export const getDepartments = async (univ: string): Promise<string[]> => {
	return axiosClient.get(`/universities/departments?university=${univ}`);
};

const createFileObject = (imageUri: string, fileName: string) =>
	platform({
		web: () => {
			const blob = fileUtils.dataURLtoBlob(imageUri);
			return fileUtils.toFile(blob, fileName);
		},
		default: () =>
			({
				uri: imageUri,
				name: fileName,
				type: 'image/png',
			}) as any,
	});

export const signup = (form: SignupForm): Promise<void> => {
	const birthday = dayUtils.getDayBy6Digit(form.birthday);
	const formData = new FormData();

	formData.append('email', form.email);
	formData.append('password', form.password);
	formData.append('phoneNumber', form.phoneNumber);
	formData.append('name', form.name);
	formData.append('birthday', birthday.format('YYYY-MM-DD'));
	formData.append('gender', form.gender);
	formData.append('mbti', form.mbti);
	formData.append('universityName', form.universityName);
	formData.append('age', dayUtils.getAgeBy6Digit(form.birthday).toString());
	formData.append('departmentName', form.departmentName);
	formData.append('grade', form.grade);
	formData.append('studentNumber', form.studentNumber);
	formData.append('instagramId', form.instagramId);

	form.profileImages.forEach((imageUri) => {
		const file = createFileObject(imageUri, `${form.email}-${nanoid(6)}.png`);
		formData.append('profileImages', file);
	});

	return axiosClient.post('/auth/signup', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};

const authenticateSmsCode = (smsCode: AuthorizeSmsCode): Promise<void> =>
	axiosClient.patch('/auth/sms', smsCode);

type Service = {
	getUnivs: () => Promise<string[]>;
	getDepartments: (univ: string) => Promise<string[]>;
	signup: (form: SignupForm) => Promise<void>;
	sendVerificationCode: (phoneNumber: string) => Promise<{ uniqueKey: string }>;
	authenticateSmsCode: (smsCode: AuthorizeSmsCode) => Promise<void>;
};

const sendVerificationCode = (phoneNumber: string): Promise<{ uniqueKey: string }> =>
	axiosClient.post('/auth/sms/send', { phoneNumber });

const apis: Service = {
	getUnivs,
	getDepartments,
	signup,
	sendVerificationCode,
	authenticateSmsCode,
};

export default apis;
