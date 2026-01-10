import { AUTH_METHODS } from '@/src/shared/constants/mixpanel-events';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { devLogWithTag } from '@/src/shared/utils';
import AppleLogo from '@assets/icons/apple-logo.svg';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import useSignupProgress from '../hooks/use-signup-progress';
import { useAppleLogin } from '../queries/use-apple-login';

interface SocialLoginIconsProps {
	onPressPass: () => void;
	isPassLoading?: boolean;
}

export function SocialLoginIcons({ onPressPass, isPassLoading = false }: SocialLoginIconsProps) {
	const { authEvents, signupEvents } = useMixpanel();
	const { removeValue: removeAppleUserId } = useStorage({ key: 'appleUserId' });
	const { setValue: setAppleUserFullName, removeValue: removeAppleUserFullName } = useStorage<
		string | null
	>({ key: 'appleUserFullName' });
	const mutation = useAppleLogin();
	const [isAppleLoading, setIsAppleLoading] = useState(false);
	const { setAuthMethod } = useSignupProgress();

	const extractUserIdFromIdToken = (idToken: string): string | null => {
		try {
			const payload = idToken.split('.')[1];
			const decoded = JSON.parse(atob(payload));
			return decoded.sub || null;
		} catch {
			return null;
		}
	};

	const handleIOSAppleLogin = async (): Promise<void> => {
		if (isAppleLoading) return;

		setAuthMethod(AUTH_METHODS.APPLE);
		authEvents.trackLoginStarted('apple');
		signupEvents.trackSignupStarted();

		try {
			setIsAppleLoading(true);
			await removeAppleUserId();
			await removeAppleUserFullName();

			const credential = await AppleAuthentication.signInAsync({
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

			await mutation.mutateAsync({ appleId: credential.user });
		} catch (error: unknown) {
			const errorObj = error as { code?: string };
			if (errorObj.code === 'ERR_CANCELED') {
				devLogWithTag('Apple Login', 'User canceled');
			} else {
				console.error('iOS Apple 로그인 실패:', error);
				authEvents.trackLoginFailed('apple', 'authentication_error');
			}
		} finally {
			setIsAppleLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Pressable
				onPress={onPressPass}
				disabled={isPassLoading}
				style={[styles.iconButton, isPassLoading && styles.disabled]}
			>
				{isPassLoading ? (
					<ActivityIndicator size="small" color="#FF3A4A" />
				) : (
					<Image
						source={require('@assets/images/pass-icon-circle.png')}
						style={styles.icon}
						resizeMode="contain"
					/>
				)}
			</Pressable>

			<View style={styles.divider} />

			<Pressable
				onPress={handleIOSAppleLogin}
				disabled={isAppleLoading}
				style={[styles.iconButton, styles.appleButton, isAppleLoading && styles.disabled]}
			>
				{isAppleLoading ? (
					<ActivityIndicator size="small" color="#FFFFFF" />
				) : (
					<AppleLogo width={24} height={24} fill="#FFFFFF" />
				)}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 15,
		marginBottom: 24,
	},
	iconButton: {
		width: 43,
		height: 43,
		borderRadius: 21.5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	appleButton: {
		backgroundColor: '#000000',
	},
	icon: {
		width: 43,
		height: 43,
		borderRadius: 21.5,
	},
	divider: {
		width: 1,
		height: 14,
		backgroundColor: '#E0E0E0',
	},
	disabled: {
		opacity: 0.6,
	},
});
