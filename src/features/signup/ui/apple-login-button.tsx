import { useStorage } from '@/src/shared/hooks/use-storage';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppleLoginResponse, useAppleLogin } from '../queries/use-apple-login';
import { devLogWithTag } from '@/src/shared/utils';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import AppleLogo from '@assets/icons/apple-logo.svg';

declare global {
	interface Window {
		AppleID?: {
			auth: {
				init: (config: AppleWebConfig) => void;
				signIn: () => Promise<AppleWebResponse>;
			};
		};
		sessionStorage: Storage;
	}
}

interface AppleWebConfig {
	clientId: string;
	scope: string;
	redirectURI: string;
	state: string;
	usePopup: boolean;
}

interface AppleWebResponse {
	authorization: {
		code: string;
		id_token: string;
		state: string;
	};
	user?: {
		email?: string;
		name?: {
			firstName: string;
			lastName: string;
		};
	};
}

interface AppleIOSCredential {
	identityToken: string | null;
	user: string;
	email: string | null;
	fullName: AppleAuthentication.AppleAuthenticationFullName | null;
	authorizationCode: string | null;
}

interface BackendAppleData {
	platform: 'web' | 'ios';
	authorization?: {
		code: string;
		id_token: string;
		state: string;
	};
	user?: {
		email?: string;
		name?: {
			firstName: string;
			lastName: string;
		};
	};
	identityToken?: string | null;
	userId?: string;
	email?: string | null;
	fullName?: AppleAuthentication.AppleAuthenticationFullName | null;
	authorizationCode?: string | null;
}

interface BackendResponse {
	success: boolean;
	token?: string;
	error?: string;
}

const AppleLoginButton: React.FC = () => {
	const { t } = useTranslation();
	const { authEvents, signupEvents } = useMixpanel();
	const { removeValue: removeAppleUserId } = useStorage({ key: 'appleUserId' });
	const { setValue: setLoginType } = useStorage<string | null>({
		key: 'loginType',
	});
	const { setValue: setAppleUserFullName, removeValue: removeAppleUserFullName } = useStorage<
		string | null
	>({ key: 'appleUserFullName' });
	const [isAppleJSLoaded, setIsAppleJSLoaded] = useState<boolean>(false);
	const mutation = useAppleLogin();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	useEffect(() => {
		initializeAppleLogin();
	}, []);

	const initializeAppleLogin = async (): Promise<void> => {
		if (Platform.OS === 'web') {
			loadAppleJS();
		} else if (Platform.OS === 'ios') {
			try {
				const available = await AppleAuthentication.isAvailableAsync();
				available;
			} catch (error) {
				console.error('Apple 로그인 가용성 확인 실패:', error);
			}
		}
	};

	const loadAppleJS = (): void => {
		if (typeof window !== 'undefined' && window.AppleID) {
			setIsAppleJSLoaded(true);
			initAppleJS();
			return;
		}

		const script = document.createElement('script');
		script.src =
			'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
		script.async = true;
		script.onload = () => {
			setIsAppleJSLoaded(true);
			initAppleJS();
		};
		script.onerror = () => {
			console.error('Apple JS 로드 실패');
		};
		document.head.appendChild(script);
	};

	const initAppleJS = (): void => {
		if (typeof window !== 'undefined' && window.AppleID) {
			window.AppleID.auth.init({
				clientId: 'com.some-in-univ.web', // 웹용 Service ID
				scope: 'name',
				redirectURI: 'https://some-in-univ.com/auth/login',
				state: 'web-login',
				usePopup: true,
			});
		}
	};

	const extractUserIdFromIdToken = (idToken: string): string | null => {
		try {
			const payload = idToken.split('.')[1];
			const decoded = JSON.parse(atob(payload));
			return decoded.sub || null;
		} catch {
			return null;
		}
	};

	const sendToBackend = async (data: BackendAppleData): Promise<void> => {
		try {
			setIsLoading(true);

			let userId = data.userId;
			if (data.platform === 'web' && data.authorization?.id_token) {
				userId = extractUserIdFromIdToken(data.authorization.id_token) ?? undefined;
			}

			await mutation.mutateAsync(userId ?? '');
		} catch (error) {
			console.error('백엔드 요청 실패:', error);
			authEvents.trackLoginFailed('apple', 'backend_error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleWebAppleLogin = async (): Promise<void> => {
		devLogWithTag('Apple Login', 'Button clicked', { hasSDK: !!window.AppleID });
		if (!window.AppleID || isLoading) return;

		authEvents.trackLoginStarted('apple');
		signupEvents.trackSignupStarted();

		try {
			window.sessionStorage.removeItem('appleUserId');
			window.sessionStorage.removeItem('appleUserFullName');

			const data: AppleWebResponse = await window.AppleID.auth.signIn();

			const fullName = data.user?.name;
			if (fullName) {
				const fullDisplayName = `${fullName.lastName || ''}${fullName.firstName || ''}`;
				window.sessionStorage.setItem('appleUserFullName', fullDisplayName);
			} else {
				window.sessionStorage.removeItem('appleUserFullName');
			}
			await sendToBackend({
				platform: 'web',
				authorization: data.authorization,
				user: data.user,
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			if (error.error === 'popup_closed_by_user') {
				devLogWithTag('Apple Login', 'Popup closed by user');
			} else {
				console.error('웹 Apple 로그인 실패:', error);
			}
		}
	};

	const handleIOSAppleLogin = async (): Promise<void> => {
		if (isLoading) return;

		authEvents.trackLoginStarted('apple');
		signupEvents.trackSignupStarted();

		try {
			await removeAppleUserId();
			await removeAppleUserFullName();

			const credential: AppleAuthentication.AppleAuthenticationCredential =
				await AppleAuthentication.signInAsync({
					requestedScopes: [
						AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
						AppleAuthentication.AppleAuthenticationScope.EMAIL,
					],
				});

			const fullName = credential.fullName;
			if (fullName) {
				const fullDisplayName = `${fullName.familyName || ''}${fullName.givenName || ''}`;
				await setAppleUserFullName(fullDisplayName);
			} else {
				await removeAppleUserFullName();
			}

			await sendToBackend({
				platform: 'ios',
				identityToken: credential.identityToken,
				userId: credential.user,
				email: credential.email,
				fullName: credential.fullName,
				authorizationCode: credential.authorizationCode,
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			if (error.code === 'ERR_CANCELED') {
				devLogWithTag('Apple Login', 'User canceled');
			} else {
				console.error('iOS Apple 로그인 실패:', error);
			}
		}
	};

	if (Platform.OS === 'web') {
		if (!isAppleJSLoaded) {
			return (
				<View style={styles.loadingContainer}>
					<Text style={{ color: semanticColors.text.primary }}>
						{t('features.signup.ui.login_form.apple_login_preparing')}
					</Text>
				</View>
			);
		}

		return (
			<View>
				<Pressable
					onPress={handleWebAppleLogin}
					disabled={isLoading}
					style={[styles.appleButton, isLoading && styles.disabled]}
				>
					<AppleLogo width={24} height={24} />
					<Text style={styles.appleButtonText}>
						{t('features.signup.ui.login_form.apple_login')}
					</Text>
				</Pressable>
			</View>
		);
	}

	// iOS
	if (Platform.OS === 'ios') {
		return (
			<View style={styles.iosContainer}>
				<Pressable
					onPress={handleIOSAppleLogin}
					disabled={isLoading}
					style={[styles.appleButton, isLoading && styles.disabled]}
				>
					<AppleLogo width={24} height={24} />
					<Text style={styles.appleButtonText}>
						{t('features.signup.ui.login_form.apple_login')}
					</Text>
				</Pressable>
			</View>
		);
	}

	return null;
};

const styles = StyleSheet.create({
	loadingContainer: {
		padding: 16,
		alignItems: 'center',
	},
	appleButton: {
		width: 330,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#000000',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
	},
	appleButtonText: {
		color: semanticColors.text.inverse,
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
	},
	iosContainer: {
		alignItems: 'center',
	},
	disabled: {
		opacity: 0.6,
	},
});

export default AppleLoginButton;
