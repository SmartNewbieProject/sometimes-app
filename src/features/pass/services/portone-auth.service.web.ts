import { env } from '@/src/shared/libs/env';
import type {
	PortOneIdentityVerificationRequest,
	PortOneIdentityVerificationResponse,
} from '../types';

/**
 * PortOne V2 본인인증 서비스 (Web 전용)
 * 웹 환경에서 @portone/browser-sdk를 사용한 본인인증을 처리합니다.
 */
export class PortOneAuthService {
	private readonly storeId: string;
	private readonly passChannelKey: string;

	constructor() {
		this.storeId = env.STORE_ID;
		this.passChannelKey = env.PASS_CHANNEL_KEY;

		this.validateEnvironmentVariables();
	}

	private async loadPortOneSDK() {
		const module = await import('@portone/browser-sdk/v2');
		return module;
	}

	private validateEnvironmentVariables() {
		const requiredEnvVars = [
			{ key: 'STORE_ID', value: this.storeId },
			{ key: 'PASS_CHANNEL_KEY', value: this.passChannelKey },
		];

		for (const { key, value } of requiredEnvVars) {
			if (!value) {
				throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
			}
		}
	}

	async requestIdentityVerification(
		options: Partial<PortOneIdentityVerificationRequest> = {},
	): Promise<PortOneIdentityVerificationResponse> {
		return this.requestWebAuth(options);
	}

	private async requestWebAuth(
		options: Partial<PortOneIdentityVerificationRequest>,
	): Promise<PortOneIdentityVerificationResponse> {
		try {
			if (typeof window === 'undefined') {
				throw new Error('웹 환경에서만 사용 가능합니다.');
			}
			const PortOne = await this.loadPortOneSDK();

			const identityVerificationId = `cert_${new Date().getTime()}`;

			const request: PortOneIdentityVerificationRequest = {
				storeId: this.storeId,
				channelKey: this.passChannelKey,
				identityVerificationId,
				windowType: {
					pc: 'POPUP',
					mobile: 'REDIRECTION',
				},
				redirectUrl: `${window.location.origin}/auth/login?identityVerificationId=${identityVerificationId}`,
				...options,
			};

			const response = await PortOne.requestIdentityVerification(request);

			if (!response) {
				throw new Error('본인인증 응답이 없습니다.');
			}

			if (response.code != null) {
				throw new Error(response.message || '본인인증에 실패했습니다.');
			}

			return {
				identityVerificationId: response.identityVerificationId,
				code: response.code,
				message: response.message,
			};
		} catch (error) {
			console.error('PortOne V2 SDK 오류:', error);
			throw error;
		}
	}
}
