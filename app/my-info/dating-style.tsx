import { useAuth } from '@/src/features/auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Layout from '@/src/features/layout';
import Loading from '@/src/features/loading';
import MyInfo from '@/src/features/my-info';
import type { Preferences } from '@/src/features/my-info/api';
import { ImageResources } from '@/src/shared/libs';
import { Divider, PalePurpleGradient, Text } from '@/src/shared/ui';
import { ChipSelector, StepIndicator } from '@/src/widgets';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function DatingStyleSelectionScreen() {
	const { t } = useTranslation();
	const { my } = useAuth();
	const { datingStyleIds = [], updateForm } = useMyInfoForm();
	const {
		data: preferencesArray = [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
		isLoading,
	} = usePreferenceOptionsQuery();

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === PreferenceKeys.DATING_STYLE) ??
		preferencesArray[0];

	const onChangeOption = (values: string[]) => {
		if (values.length > 3) {
			return;
		}
		updateForm('datingStyleIds', values);
	};

	const nextMessage = (() => {
		if (datingStyleIds.length < 1) {
			return t('apps.my-info.dating_style.more', {
				count: 1 - datingStyleIds.length,
			});
		}
		return t('apps.my-info.dating_style.next');
	})();

	const disabled = datingStyleIds.length < 1;

	useFocusEffect(
		useCallback(() => useMyInfoStep.getState().updateStep(MyInfoSteps.DATING_STYLE), []),
	);

	const handleNextButton = () => {
		mixpanelAdapter.track('Profile_DatingStyle', {
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
		router.push('/my-info/drinking');
	};

	return (
		<Layout.Default>
			<PalePurpleGradient />
			<View style={styles.contentContainer}>
				<Image
					source={{ uri: ImageResources.DATING_STYLE }}
					style={{ width: 81, height: 100, marginLeft: 28 }}
				/>
				<View style={styles.topContainer}>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.my-info.dating_style.title_1')}
					</Text>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.my-info.dating_style.title_2')}
					</Text>
				</View>

				<View style={styles.indicatorContainer}>
					<StepIndicator
						length={3}
						step={datingStyleIds.length}
						dotGap={4}
						dotSize={16}
						style={styles.stepIndicator}
					/>
					<Divider.Horizontal />
				</View>

				<View style={styles.chipSelectorContainer}>
					<Loading.Lottie title={t('apps.my-info.dating_style.loading')} loading={isLoading}>
						<ChipSelector
							value={datingStyleIds}
							options={
								preferences?.options?.map((option) => ({
									label: option.displayName,
									value: option.id,
									imageUrl: option?.imageUrl,
								})) ?? []
							}
							onChange={onChangeOption}
							multiple
							align="center"
							style={styles.chipSelector}
						/>
					</Loading.Lottie>
				</View>
			</View>

			<Layout.TwoButtons
				disabledNext={disabled}
				content={{
					next: nextMessage,
				}}
				onClickNext={handleNextButton}
				onClickPrevious={() => router.navigate('/my-info/personality')}
			/>
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
		marginTop: 15,
		marginBottom: 30,
	},
	indicatorContainer: {
		width: '100%',
		rowGap: 10,
		paddingHorizontal: 32,
	},
	stepIndicator: {
		alignSelf: 'flex-end',
	},
	chipSelectorContainer: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 16,
		marginTop: 8,
	},
	chipSelector: {
		marginTop: 12,
		paddingHorizontal: 24,
		justifyContent: 'flex-start',
	},
});
