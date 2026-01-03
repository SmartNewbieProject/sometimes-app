/**
 * JP 프로필 입력 화면
 *
 * SMS 인증에서는 이름/생년월일/성별을 받지 않으므로
 * 대학 선택 전에 별도로 입력받음
 */

import { useState, useCallback, useEffect } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Input } from '@/src/shared/ui';
import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSignupProgress from '@/src/features/signup/hooks/use-signup-progress';
import { isAdult } from '@/src/features/pass/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Image } from 'expo-image';

type Gender = 'MALE' | 'FEMALE';

export default function JpProfilePage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { updateForm, updateShowHeader } = useSignupProgress();
	const insets = useSafeAreaInsets();

	const [name, setName] = useState('');
	const [birthday, setBirthday] = useState('');
	const [gender, setGender] = useState<Gender | null>(null);
	const [error, setError] = useState<string | null>(null);

	// 프로그레스 바 표시를 위해 showHeader를 true로 설정
	useEffect(() => {
		updateShowHeader(true);
	}, [updateShowHeader]);

	const isValidName = name.trim().length >= 1;
	const isValidBirthday = /^\d{4}-\d{2}-\d{2}$/.test(birthday);
	const isValid = isValidName && isValidBirthday && gender !== null;

	const formatBirthdayInput = useCallback((text: string) => {
		const cleaned = text.replace(/\D/g, '').slice(0, 8);

		if (cleaned.length <= 4) {
			return cleaned;
		}
		if (cleaned.length <= 6) {
			return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
		}
		return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
	}, []);

	const calculateAge = useCallback((birthdayStr: string): number => {
		const today = new Date();
		const birth = new Date(birthdayStr);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}

		return age;
	}, []);

	const handleNext = async () => {
		if (!isValid) return;

		setError(null);

		if (!isAdult(birthday)) {
			const authMethod = useSignupProgress.getState().authMethod;
			mixpanelAdapter.track('Signup_AgeCheck_Failed', {
				birthday,
				platform: 'jp_sms',
				auth_method: authMethod,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			router.push('/auth/age-restriction');
			return;
		}

		try {
			const certInfoStr = await AsyncStorage.getItem('signup_certification_info');
			const certInfo = certInfoStr ? JSON.parse(certInfoStr) : {};

			const age = calculateAge(birthday);

			updateForm({
				name,
				birthday,
				gender,
				age,
				phoneNumber: certInfo.phone,
				loginType: certInfo.loginType || 'jp_sms',
			});

			await AsyncStorage.setItem(
				'signup_certification_info',
				JSON.stringify({
					...certInfo,
					name,
					birthday,
					gender,
				}),
			);

			const currentAuthMethod = useSignupProgress.getState().authMethod;
			mixpanelAdapter.track('Signup_JpProfile_Completed', {
				auth_method: currentAuthMethod,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});

			router.push('/auth/signup/university');
		} catch (err) {
			setError(t('features.jp-auth.profile.error'));
		}
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<DefaultLayout style={styles.layout}>
			<PalePurpleGradient />
			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.imageWrapper}>
						<Image source={require('@assets/images/details.png')} style={styles.headerImage} />
					</View>

					<View style={styles.contentWrapper}>
						<View style={styles.titleWrapper}>
							<Text size="lg" weight="semibold" textColor="purple" style={styles.title}>
								{t('features.jp-auth.profile.title')}
							</Text>
						</View>

						<View style={styles.form}>
							<View style={styles.inputGroup}>
								<Text size="14" weight="semibold" style={styles.label}>
									{t('features.jp-auth.profile.name')}
								</Text>
								<Input
									size="lg"
									value={name}
									onChangeText={setName}
									placeholder={t('features.jp-auth.profile.name_placeholder')}
								/>
							</View>

							<View style={styles.inputGroup}>
								<Text size="14" weight="semibold" style={styles.label}>
									{t('features.jp-auth.profile.birthday')}
								</Text>
								<Input
									size="lg"
									value={birthday}
									onChangeText={(text) => setBirthday(formatBirthdayInput(text))}
									placeholder={t('features.jp-auth.profile.birthday_placeholder')}
									keyboardType="number-pad"
									maxLength={10}
								/>
								<Text size="12" style={styles.hint}>
									{t('features.jp-auth.profile.birthday_hint')}
								</Text>
							</View>

							<View style={styles.inputGroup}>
								<Text size="14" weight="semibold" style={styles.label}>
									{t('features.jp-auth.profile.gender')}
								</Text>
								<View style={styles.genderContainer}>
									<Pressable
										style={({ pressed }) => [
											styles.genderButton,
											gender === 'MALE' && styles.genderButtonActive,
											pressed && styles.genderButtonPressed,
										]}
										onPress={() => setGender('MALE')}
									>
										<Text
											size="16"
											weight={gender === 'MALE' ? 'bold' : 'regular'}
											style={gender === 'MALE' ? styles.genderTextActive : styles.genderText}
										>
											{t('features.jp-auth.profile.male')}
										</Text>
									</Pressable>
									<Pressable
										style={({ pressed }) => [
											styles.genderButton,
											gender === 'FEMALE' && styles.genderButtonActive,
											pressed && styles.genderButtonPressed,
										]}
										onPress={() => setGender('FEMALE')}
									>
										<Text
											size="16"
											weight={gender === 'FEMALE' ? 'bold' : 'regular'}
											style={gender === 'FEMALE' ? styles.genderTextActive : styles.genderText}
										>
											{t('features.jp-auth.profile.female')}
										</Text>
									</Pressable>
								</View>
							</View>

							{error && (
								<Text size="14" style={styles.error}>
									{error}
								</Text>
							)}
						</View>
					</View>
				</ScrollView>

				<View style={styles.bottomContainer}>
					<TwoButtons
						disabledNext={!isValid}
						onClickNext={handleNext}
						onClickPrevious={handleBack}
					/>
				</View>
			</KeyboardAvoidingView>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	layout: {
		position: 'relative',
	},
	keyboardView: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 140,
	},
	imageWrapper: {
		paddingHorizontal: 5,
	},
	headerImage: {
		width: 81,
		height: 81,
		marginBottom: 16,
	},
	titleWrapper: {
		gap: 4,
	},
	title: {
		lineHeight: 22,
	},
	contentWrapper: {
		gap: 15,
		marginTop: 34,
		paddingHorizontal: 10,
	},
	form: {
		gap: 24,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		color: semanticColors.text.secondary,
	},
	hint: {
		color: semanticColors.text.tertiary,
		marginTop: 4,
	},
	genderContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	genderButton: {
		flex: 1,
		paddingVertical: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		alignItems: 'center',
		backgroundColor: colors.white,
	},
	genderButtonActive: {
		borderColor: semanticColors.brand.primary,
		backgroundColor: semanticColors.brand.primary,
	},
	genderButtonPressed: {
		opacity: 0.7,
	},
	genderText: {
		color: semanticColors.text.secondary,
	},
	genderTextActive: {
		color: colors.white,
	},
	error: {
		color: '#DC2626',
		textAlign: 'center',
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		paddingTop: 16,
		paddingHorizontal: 0,
		backgroundColor: 'transparent',
	},
});
