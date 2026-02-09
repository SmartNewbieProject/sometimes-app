import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { useOnboardingQuestionsQuery } from '../../queries/onboarding';
import { IntroFeatures } from './components';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

export const OnboardingIntro = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { data: questionsData, isLoading } = useOnboardingQuestionsQuery();

	const questionCount = questionsData?.questions?.length ?? 0;

	const features = [
		t(MOMENT_ONBOARDING_KEYS.intro.feature1, { count: questionCount }),
		t(MOMENT_ONBOARDING_KEYS.intro.feature2),
		t(MOMENT_ONBOARDING_KEYS.intro.feature3),
	];

	const handleStart = () => {
		router.push('/moment/onboarding/questions');
	};

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#E8DEFF']}
				locations={[0, 0.6, 1]}
				style={styles.gradient}
			/>

			<View style={[styles.content, { paddingTop: insets.top + 40 }]}>
				<View style={styles.imageContainer}>
					<Image
						source={require('@/assets/images/moment/miho-mailbox.webp')}
						style={styles.characterImage}
						resizeMode="contain"
					/>
				</View>

				<View style={styles.textContainer}>
					<Text size="24" weight="bold" textColor="black" style={styles.title}>
						{t(MOMENT_ONBOARDING_KEYS.intro.title)}
					</Text>
					<Text size="15" weight="normal" textColor="gray" style={styles.subtitle}>
						{t(MOMENT_ONBOARDING_KEYS.intro.subtitle)}
					</Text>
				</View>

				<View style={styles.featuresContainer}>
					<IntroFeatures features={features} />
				</View>
			</View>

			<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
				<Button variant="primary" size="lg" onPress={handleStart} style={styles.startButton}>
					<View style={styles.buttonContent}>
						<Sparkles size={18} color="#FFFFFF" />
						<Text size="16" weight="semibold" textColor="white">
							{t(MOMENT_ONBOARDING_KEYS.intro.startButton)}
						</Text>
					</View>
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	imageContainer: {
		alignItems: 'center',
		marginBottom: 24,
		overflow: 'hidden',
	},
	characterImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 32,
	},
	title: {
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		textAlign: 'center',
	},
	featuresContainer: {
		marginTop: 8,
	},
	buttonContainer: {
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	startButton: {
		width: '100%',
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
});
