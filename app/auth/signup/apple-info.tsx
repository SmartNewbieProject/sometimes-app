import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mars, Venus } from 'lucide-react-native';
import { Text, Input } from '@/src/shared/ui';
import { TwoButtons } from '@/src/features/layout/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSignupProgress from '@/src/features/signup/hooks/use-signup-progress';
import { useStorage } from '@/src/shared/hooks/use-storage';
import AppleLogo from '@assets/icons/apple-logo.svg';
import { isJapanese } from '@/src/shared/libs/local';
import {
	autoFormatJpPhoneInput,
	validateJpPhoneNumber,
	formatJpPhoneForApi,
} from '@/src/features/jp-auth/utils/phone-format';

type Gender = 'MALE' | 'FEMALE';

export default function AppleUserInfoPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { updateForm, form, updateShowHeader } = useSignupProgress();
	const isJp = useMemo(() => isJapanese(), []);

	const { value: appleUserFullName, loading: fullNameLoading } = useStorage<string | null>({
		key: 'appleUserFullName',
	});

	const [name, setName] = useState(form.name || '');
	const [birthday, setBirthday] = useState('');
	const [gender, setGender] = useState<Gender | null>((form.gender as Gender) || null);
	const [phone, setPhone] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		updateShowHeader(true);
	}, [updateShowHeader]);

	useEffect(() => {
		const loadCertificationInfo = async () => {
			try {
				const certInfoStr = await AsyncStorage.getItem('signup_certification_info');
				if (certInfoStr) {
					const certInfo = JSON.parse(certInfoStr);
					updateForm({
						loginType: certInfo.loginType,
						appleId: certInfo.appleId,
					});
				}
			} catch (err) {
				console.error('Failed to load certification info:', err);
			}
		};

		loadCertificationInfo();
	}, [updateForm]);

	useEffect(() => {
		let appleName = null;

		if (Platform.OS === 'web') {
			appleName = sessionStorage.getItem('appleUserFullName');
		} else if (appleUserFullName) {
			appleName = appleUserFullName;
		}

		if (appleName) {
			setName(appleName);
			updateForm({ name: appleName });
		}
	}, [appleUserFullName, updateForm]);

	const shouldHideNameInput =
		!!appleUserFullName || (Platform.OS === 'web' && !!sessionStorage.getItem('appleUserFullName'));

	const isValidName = name.trim().length >= 1;
	const isValidBirthday = /^\d{4}-\d{2}-\d{2}$/.test(birthday);
	const isValidPhone = isJp ? validateJpPhoneNumber(phone) : phone.replace(/\D/g, '').length === 11;
	const isValid = isValidName && isValidBirthday && gender !== null && isValidPhone;

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

	const formatPhoneInput = useCallback(
		(text: string) => {
			if (isJp) {
				return autoFormatJpPhoneInput(text);
			}

			let digits = text.replace(/\D/g, '');

			if (!digits.startsWith('010')) {
				digits = `010${digits.replace(/^010/, '')}`;
			}

			digits = digits.slice(0, 11);

			if (digits.length <= 3) {
				return digits;
			}
			if (digits.length <= 7) {
				return `${digits.slice(0, 3)}-${digits.slice(3)}`;
			}
			return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
		},
		[isJp],
	);

	const handlePhoneChange = (text: string) => {
		const formatted = formatPhoneInput(text);
		setPhone(formatted);
	};

	const handleNext = async () => {
		if (!isValid) return;

		setError(null);

		try {
			const phoneDigits = phone.replace(/\D/g, '');
			const formattedPhone = isJp
				? formatJpPhoneForApi(phoneDigits)
				: `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 7)}-${phoneDigits.slice(7)}`;

			updateForm({
				name,
				gender,
				birthday,
				phone: formattedPhone,
				phoneNumber: formattedPhone,
				loginType: isJp ? 'apple_jp' : 'apple',
				country: isJp ? 'JP' : 'KR',
			});

			router.push('/auth/signup/university');
		} catch (err) {
			setError(t('features.jp-auth.profile.error'));
		}
	};

	const handleBack = () => {
		router.back();
	};

	if (fullNameLoading) {
		return null;
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.headerSection}>
					<View style={styles.appleIconContainer}>
						<AppleLogo width={32} height={32} />
					</View>
					<Text size="14" style={styles.headerSubtitle}>
						{t('apps.auth.register.please_input')}
					</Text>
				</View>

				<View style={styles.form}>
					{!shouldHideNameInput && (
						<View style={styles.inputGroup}>
							<Text size="14" weight="semibold" style={styles.label}>
								{t('apps.auth.register.input_name')}
							</Text>
							<Input
								size="lg"
								value={name}
								onChangeText={setName}
								placeholder={t('apps.auth.register.miho')}
								maxLength={20}
							/>
						</View>
					)}

					<View style={styles.inputGroup}>
						<Text size="14" weight="semibold" style={styles.label}>
							{t('apps.auth.register.input_sex')}
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
								<Mars
									size={20}
									color={gender === 'MALE' ? colors.white : semanticColors.text.secondary}
								/>
								<Text
									size="16"
									weight={gender === 'MALE' ? 'bold' : 'regular'}
									style={gender === 'MALE' ? styles.genderTextActive : styles.genderText}
								>
									{t('apps.auth.register.male')}
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
								<Venus
									size={20}
									color={gender === 'FEMALE' ? colors.white : semanticColors.text.secondary}
								/>
								<Text
									size="16"
									weight={gender === 'FEMALE' ? 'bold' : 'regular'}
									style={gender === 'FEMALE' ? styles.genderTextActive : styles.genderText}
								>
									{t('apps.auth.register.female')}
								</Text>
							</Pressable>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text size="14" weight="semibold" style={styles.label}>
							{t('apps.auth.register.input_birth')}
						</Text>
						<Input
							size="lg"
							value={birthday}
							onChangeText={(text) => setBirthday(formatBirthdayInput(text))}
							placeholder="YYYY-MM-DD"
							keyboardType="number-pad"
							maxLength={10}
						/>
						<Text size="12" style={styles.hint}>
							{t('features.jp-auth.profile.birthday_hint')}
						</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text size="14" weight="semibold" style={styles.label}>
							{t('apps.auth.register.input_phone')}
						</Text>
						<Input
							size="lg"
							value={phone}
							onChangeText={handlePhoneChange}
							placeholder={isJp ? '080-0000-0000' : '010-0000-0000'}
							keyboardType="number-pad"
							maxLength={13}
						/>
					</View>

					{error && (
						<Text size="14" style={styles.error}>
							{error}
						</Text>
					)}
				</View>
			</ScrollView>

			<View style={styles.bottomContainer}>
				<TwoButtons disabledNext={!isValid} onClickNext={handleNext} onClickPrevious={handleBack} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingBottom: 140,
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 24,
		gap: 12,
	},
	appleIconContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#000000',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerSubtitle: {
		color: semanticColors.text.secondary,
		textAlign: 'center',
	},
	form: {
		gap: 24,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		color: semanticColors.brand.primary,
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
		flexDirection: 'row',
		paddingVertical: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
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
