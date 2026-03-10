import Interest from '@/src/features/interest';
import Layout from '@/src/features/layout';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { PalePurpleGradient, Text } from '@/src/shared/ui';
import { MbtiSelector } from '@/src/widgets/mbti-selector';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

const { hooks, services } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;

function LikeMbti() {
	const { t } = useTranslation();
	const router = useRouter();
	const { goodMbti, updateForm } = useInterestForm();
	const { updateStep } = useInterestStep();
	useFocusEffect(useCallback(() => updateStep(InterestSteps.GOODMBTI), [updateStep]));
	const onUpdateMbti = (mbti: string) => {
		updateForm('goodMbti', mbti);
	};

	const onNext = () => {
		mixpanelAdapter.track('Interest_likeMbti', { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
		router.push('/interest/bad-mbti');
	};

	const nextMessage = (() => {
		if (!goodMbti) {
			return t('apps.interest.like_mbti.next_none');
		}
		return t('next');
	})();

	return (
		<Layout.Default>
			<PalePurpleGradient />
			<View style={styles.contentContainer}>
				<Image
					source={require('@assets/images/everybody-happy.png')}
					style={{ width: 81, height: 81, marginLeft: 28 }}
				/>
				<View style={styles.topContainer}>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.like_mbti.title')}
					</Text>
				</View>
				<View style={styles.bar} />

				<MbtiSelector
					key={goodMbti ?? 'none'}
					value={goodMbti ?? ''}
					onChange={onUpdateMbti}
					onBlur={() => {}}
				/>
				<Layout.TwoButtons
					disabledNext={false}
					content={{
						next: nextMessage,
					}}
					onClickNext={onNext}
					onClickPrevious={() => router.navigate('/interest/age')}
				/>
			</View>
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	topContainer: {
		marginHorizontal: 32,
		marginTop: 15,
	},
	contentContainer: {
		flex: 1,
	},
	ageContainer: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
	},
	bar: {
		marginHorizontal: 32,

		height: 0.5,
		backgroundColor: semanticColors.surface.background,
		marginTop: 39,
		marginBottom: 30,
	},
});

export default LikeMbti;
