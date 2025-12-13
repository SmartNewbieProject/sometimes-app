import type {
	PortOneIdentityVerificationRequest,
	PortOneIdentityVerificationResponse,
} from '../types';

/**
 * PortOne V2 본인인증 서비스 (Native 전용)
 * 모바일 환경에서는 MobileIdentityVerification 컴포넌트를 통해 처리되므로
 * 이 서비스는 stub 역할만 합니다.
 */
export class PortOneAuthService {
	private readonly storeId: string;
	private readonly passChannelKey: string;

	constructor() {
		this.storeId = process.env.EXPO_PUBLIC_STORE_ID as string;
		this.passChannelKey = process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY as string;

		this.validateEnvironmentVariables();
	}

	private validateEnvironmentVariables() {
		const requiredEnvVars = [
			{ key: 'EXPO_PUBLIC_STORE_ID', value: this.storeId },
			{ key: 'EXPO_PUBLIC_PASS_CHANNEL_KEY', value: this.passChannelKey },
		];

		for (const { key, value } of requiredEnvVars) {
			if (!value) {
				throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
			}
		}
	}

	async requestIdentityVerification(
		_options: Partial<PortOneIdentityVerificationRequest> = {},
	): Promise<PortOneIdentityVerificationResponse> {
		throw new Error(
			'모바일 환경에서는 MobileIdentityVerification 컴포넌트를 사용해주세요.',
		);
	}
}
