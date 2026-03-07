import { Header, Text, PalePurpleGradient } from '@/src/shared/ui';
import { LabelInput } from '@/src/widgets/label-input';
import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View, Pressable, Linking, StyleSheet } from 'react-native';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { useState, useEffect } from 'react';
import {
	sendEmailVerification,
	verifyEmailCode,
	getProfileId,
	getUniversityVerificationStatus,
	MESSAGES,
	UI_CONSTANTS,
} from '@/src/features/university-verification';
import { useInvalidateFreeRewardStatus } from '@/src/features/free-reward';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';

export default function UniversityVerificationScreen() {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const invalidateFreeRewardStatus = useInvalidateFreeRewardStatus();
	const queryClient = useQueryClient();

	const [email, setEmail] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

	useEffect(() => {
		const checkExistingVerification = async () => {
			const profileId = await getProfileId().catch(() => null);
			if (!profileId) return;
			const status = await getUniversityVerificationStatus(profileId).catch(() => null);
			if (status?.verifiedAt) {
				const verifiedYear = new Date(status.verifiedAt).getFullYear();
				if (verifiedYear === new Date().getFullYear()) {
					setIsAlreadyVerified(true);
				}
			}
		};
		checkExistingVerification();
	}, []);

	const handleEmailVerification = async () => {
		if (!email.trim()) {
			showModal({
				title: t('apps.university-verification.confirm_button'),
				children: t('apps.university-verification.messages.email_required'),
				primaryButton: {
					text: t('apps.university-verification.confirm_button'),
					onClick: () => {},
				},
			});
			return;
		}

		setIsLoading(true);
		await tryCatch(
			async () => {
				await sendEmailVerification(email);
				showModal({
					title: t('apps.university-verification.send_code_button'),
					children: t('apps.university-verification.messages.code_sent'),
					primaryButton: {
						text: t('apps.university-verification.confirm_button'),
						onClick: () => {},
					},
				});
			},
			(error) => {
				showModal({
					title: t('apps.university-verification.confirm_button'),
					children: error.error,
					primaryButton: {
						text: t('apps.university-verification.confirm_button'),
						onClick: () => {},
					},
				});
			},
		);
		setIsLoading(false);
	};

	const handleCodeVerification = async () => {
		if (!email.trim() || !verificationCode.trim()) {
			showModal({
				title: t('apps.university-verification.confirm_button'),
				children: t('apps.university-verification.messages.fields_required'),
				primaryButton: {
					text: t('apps.university-verification.confirm_button'),
					onClick: () => {},
				},
			});
			return;
		}

		setIsLoading(true);
		await tryCatch(
			async () => {
				const profileId = await getProfileId();

				if (!profileId) {
					throw new Error(t('apps.university-verification.messages.user_info_error'));
				}

				await verifyEmailCode(email, verificationCode, profileId);

				setIsVerified(true);
				invalidateFreeRewardStatus();
				queryClient.invalidateQueries({ queryKey: ['gem-mission', 'university-verification'] });
				queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
				showModal({
					title: t('apps.university-verification.confirm_button'),
					children: t('apps.university-verification.messages.verification_success'),
					primaryButton: {
						text: t('apps.university-verification.confirm_button'),
						onClick: () => {},
					},
				});
			},
			(error) => {
				showModal({
					title: t('apps.university-verification.confirm_button'),
					children: error.error || t('apps.university-verification.messages.verification_failed'),
					primaryButton: {
						text: t('apps.university-verification.confirm_button'),
						onClick: () => {},
					},
				});
			},
		);
		setIsLoading(false);
	};

	const handleDMClick = () => {
		Linking.openURL('https://www.instagram.com/sometime.in.univ?igsh=MTdxMWJjYmFrdGc3Ng==');
	};

	const handleIDcardCertification = () => {
		router.push('/university-verification/idcard');
	};

	const handleConfirm = () => {
		if (!isVerified) {
			showModal({
				title: t('apps.university-verification.confirm_button'),
				children: t('apps.university-verification.messages.not_verified'),
				primaryButton: {
					text: t('apps.university-verification.confirm_button'),
					onClick: () => {},
				},
			});
			return;
		}

		router.push('/university-verification/success');
	};

	if (isAlreadyVerified) {
		return (
			<View style={styles.container}>
				<PalePurpleGradient />
				<Header.Container>
					<Header.LeftContent>
						<Pressable onPress={() => router.back()} style={styles.backButton}>
							<ChevronLeftIcon width={24} height={24} />
						</Pressable>
					</Header.LeftContent>
					<Header.CenterContent>
						<Text size="lg" weight="regular" textColor="black">
							{t('apps.university-verification.header_title')}
						</Text>
					</Header.CenterContent>
					<Header.RightContent />
				</Header.Container>
				<View style={styles.alreadyVerifiedContainer}>
					<Text size="xl" weight="semibold" textColor="black" style={styles.alreadyVerifiedTitle}>
						✓ 이미 인증 완료
					</Text>
					<Text size="sm" weight="regular" style={styles.alreadyVerifiedDesc}>
						이미 대학 이메일 인증이 완료되었어요.
					</Text>
					<TouchableOpacity onPress={() => router.back()} style={styles.confirmButton}>
						<Text size="md" weight="regular" textColor="white">
							돌아가기
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<PalePurpleGradient />
			<Header.Container>
				<Header.LeftContent>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<ChevronLeftIcon width={24} height={24} />
					</Pressable>
				</Header.LeftContent>
				<Header.CenterContent>
					<Text size="lg" weight="regular" textColor="black">
						{t('apps.university-verification.header_title')}
					</Text>
				</Header.CenterContent>
				<Header.RightContent></Header.RightContent>
			</Header.Container>

			<View style={styles.container}>
				<ScrollView style={styles.scrollView}>
					<View style={styles.formContainer}>
						{/* 학교 이메일 주소 입력 섹션 */}
						<View style={styles.inputSection}>
							<View style={styles.inputRow}>
								<View style={styles.inputWrapper}>
									<LabelInput
										label=""
										placeholder={t('apps.university-verification.email_input_placeholder')}
										size="sm"
										value={email}
										onChangeText={setEmail}
									/>
								</View>
								<TouchableOpacity
									onPress={handleEmailVerification}
									disabled={isLoading}
									style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
								>
									<Text size="sm" weight="medium" textColor="purple" style={styles.buttonText}>
										{isLoading
											? t('apps.university-verification.sending_code')
											: t('apps.university-verification.send_code_button')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						{/* 인증번호 입력 섹션 */}
						<View style={styles.inputSection}>
							<View style={styles.inputRow}>
								<View style={styles.inputWrapper}>
									<LabelInput
										label=""
										placeholder={t('apps.university-verification.code_input_placeholder')}
										size="sm"
										maxLength={UI_CONSTANTS.VERIFICATION_CODE_MAX_LENGTH}
										value={verificationCode}
										onChangeText={setVerificationCode}
									/>
								</View>
								<TouchableOpacity
									onPress={handleCodeVerification}
									disabled={isLoading}
									style={[
										styles.actionButton,
										styles.actionButtonWithPadding,
										isLoading && styles.actionButtonDisabled,
									]}
								>
									<Text size="sm" weight="medium" textColor="purple" style={styles.buttonText}>
										{isLoading
											? t('apps.university-verification.verifying_code')
											: t('apps.university-verification.confirm_button')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>

				<View style={styles.guideContainer}>
					<Text size="sm" weight="regular" style={styles.grayText}>
						{t('apps.university-verification.no_email_guide_1')}
					</Text>
					<View style={styles.guideRow}>
						<TouchableOpacity onPress={handleIDcardCertification}>
							<Text size="sm" weight="regular" style={styles.grayUnderlineText}>
								{t('apps.university-verification.idcard_submit_link')}
							</Text>
						</TouchableOpacity>
						<Text size="sm" weight="regular" style={styles.grayText}>
							{t('apps.university-verification.idcard_submit_guide')}
						</Text>
					</View>
					<Text size="sm" weight="regular" style={styles.grayText}>
						{t('apps.university-verification.idcard_reward_guide')}
					</Text>
					<View style={styles.dmGuideContainer}>
						<Text size="sm" weight="regular" style={styles.grayText}>
							{t('apps.university-verification.dm_guide_1')}
						</Text>
						<View style={styles.guideRowWrap}>
							<TouchableOpacity onPress={handleDMClick}>
								<Text size="sm" weight="regular" style={styles.grayUnderlineText}>
									{t('apps.university-verification.no_email_guide_2')}
								</Text>
							</TouchableOpacity>
							<Text size="sm" weight="regular" style={styles.grayText}>
								{t('apps.university-verification.dm_guide_2')}
							</Text>
						</View>
					</View>
				</View>

				{/* 하단 완료 버튼 */}
				<View style={styles.bottomButtonContainer}>
					<TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
						<Text size="md" weight="regular" textColor="white">
							{t('apps.university-verification.complete_verification_button')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 20,
	},
	formContainer: {
		marginTop: 32,
	},
	inputSection: {
		marginBottom: 32,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		columnGap: 12,
	},
	inputWrapper: {
		flex: 1,
	},
	actionButton: {
		backgroundColor: semanticColors.surface.background,
		borderWidth: 1,
		borderColor: '#C084FC',
		borderRadius: 16,
		width: 112,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
	actionButtonWithPadding: {
		paddingHorizontal: 8,
	},
	actionButtonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		textAlign: 'center',
	},
	guideContainer: {
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	guideRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 4,
	},
	guideRowWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	grayText: {
		color: colors.gray,
	},
	grayUnderlineText: {
		color: colors.gray,
		textDecorationLine: 'underline',
	},
	dmGuideContainer: {
		marginTop: 16,
	},
	bottomButtonContainer: {
		paddingHorizontal: 20,
		paddingBottom: 32,
	},
	confirmButton: {
		width: '100%',
		backgroundColor: colors.darkPurple,
		borderRadius: 16,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	alreadyVerifiedContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		gap: 12,
	},
	alreadyVerifiedTitle: {
		marginBottom: 4,
	},
	alreadyVerifiedDesc: {
		color: colors.gray,
		marginBottom: 24,
		textAlign: 'center',
	},
});
