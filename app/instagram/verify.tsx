import { useUpdateInstagramId } from '@/src/features/instagram';
import { DefaultLayout } from '@/src/features/layout/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { INSTAGRAM_KEYS } from '@/src/shared/libs/locales/keys';
import { Button, Header, Input, Text } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function HeartIcon() {
	return (
		<Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
			<Path
				d="M10 17.5L8.79167 16.4083C4.5 12.5167 1.66667 9.95 1.66667 6.83333C1.66667 4.26667 3.68333 2.25 6.25 2.25C7.7 2.25 9.09167 2.925 10 3.99167C10.9083 2.925 12.3 2.25 13.75 2.25C16.3167 2.25 18.3333 4.26667 18.3333 6.83333C18.3333 9.95 15.5 12.5167 11.2083 16.4167L10 17.5Z"
				fill="#D4B6FF"
			/>
		</Svg>
	);
}

const REFERRER_ROUTES: Record<string, string> = {
	home: '/home',
	mypage: '/my',
	'profile-edit': '/profile-edit/profile',
};

export default function InstagramVerifyPage() {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { referrer } = useLocalSearchParams<{ referrer?: string }>();
	const { showModal } = useModal();

	const [instagramId, setInstagramId] = useState('');
	const [isFocused, setIsFocused] = useState(false);

	const { mutate: updateInstagram, isPending } = useUpdateInstagramId();

	const isValidInstagramId = (id: string): boolean => {
		if (!id || id.trim().length === 0) return false;
		const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
		return instagramRegex.test(id.trim());
	};

	const canSubmit = isValidInstagramId(instagramId) && !isPending;

	const handleBack = () => {
		const backRoute = referrer ? REFERRER_ROUTES[referrer] : '/home';
		router.replace((backRoute as '/home') || '/home');
	};

	const handleSubmit = () => {
		if (!canSubmit) return;

		updateInstagram(
			{ instagramId: instagramId.trim() },
			{
				onSuccess: (response) => {
					if (response.rewarded) {
						showModal({
							title: t(INSTAGRAM_KEYS.verifySuccessRewardedTitle),
							children: t(INSTAGRAM_KEYS.verifySuccessRewardedMessage),
							showParticle: true,
							showLogo: true,
							primaryButton: {
								text: t(INSTAGRAM_KEYS.servicesConfirm),
								onClick: handleBack,
							},
						});
					} else {
						showModal({
							title: t(INSTAGRAM_KEYS.verifySuccessTitle),
							children: t(INSTAGRAM_KEYS.verifySuccessMessage),
							primaryButton: {
								text: t(INSTAGRAM_KEYS.servicesConfirm),
								onClick: handleBack,
							},
						});
					}
				},
				onError: () => {
					showModal({
						title: t(INSTAGRAM_KEYS.servicesErrorTitle),
						children: t(INSTAGRAM_KEYS.verifyErrorMessage),
						primaryButton: {
							text: t(INSTAGRAM_KEYS.servicesConfirm),
						},
					});
				},
			},
		);
	};

	return (
		<DefaultLayout>
			<Header
				title={t(INSTAGRAM_KEYS.verifyHeaderTitle)}
				showBackButton={true}
				showLogo={false}
				centered={true}
				onBackPress={handleBack}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.iconContainer}>
					<Image
						source={require('@assets/images/instagram.webp')}
						style={styles.icon}
						contentFit="contain"
					/>
				</View>

				<View style={styles.titleContainer}>
					<Text size="lg" weight="semibold" textColor="black">
						{t(INSTAGRAM_KEYS.verifyTitle)}
					</Text>
					<Text size="sm" textColor="gray" style={styles.subtitle}>
						{t(INSTAGRAM_KEYS.verifyDescription)}
					</Text>
				</View>

				<View style={styles.inputContainer}>
					<View style={styles.inputWrapper}>
						<Text size="md" weight="light" textColor="black" style={styles.atSymbol}>
							@
						</Text>
						<Input
							size="lg"
							value={instagramId}
							onChangeText={(text) => setInstagramId(text.trim())}
							placeholder={t(INSTAGRAM_KEYS.verifyPlaceholder)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							autoCapitalize="none"
							autoCorrect={false}
							containerStyle={styles.inputFlex}
							style={isFocused ? styles.inputFocused : undefined}
						/>
					</View>
				</View>
			</ScrollView>

			<View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
				<View style={styles.privacyNote}>
					<HeartIcon />
					<Text size="sm" style={styles.privacyText}>
						{t(INSTAGRAM_KEYS.verifyPrivacyNote)}
					</Text>
				</View>

				<Button
					onPress={handleSubmit}
					disabled={!canSubmit}
					loading={isPending}
					styles={styles.submitButton}
				>
					<Text size="lg" weight="semibold" style={styles.submitButtonText}>
						{t(INSTAGRAM_KEYS.verifySubmitButton)}
					</Text>
				</Button>
			</View>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 30,
		paddingTop: 40,
	},
	iconContainer: {
		marginBottom: 40,
	},
	icon: {
		width: 80,
		height: 80,
	},
	titleContainer: {
		gap: 10,
		marginBottom: 32,
	},
	subtitle: {
		lineHeight: 20,
	},
	inputContainer: {
		marginBottom: 24,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	atSymbol: {
		marginBottom: 8,
	},
	inputFlex: {
		flex: 1,
	},
	inputFocused: {
		borderBottomColor: semanticColors.brand.primary,
	},
	bottomContainer: {
		paddingHorizontal: 30,
		paddingTop: 16,
		gap: 16,
	},
	privacyNote: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	privacyText: {
		color: '#9B94AB',
	},
	submitButton: {
		borderRadius: 20,
		height: 50,
	},
	submitButtonText: {
		color: 'white',
	},
});
