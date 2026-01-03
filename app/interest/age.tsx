import type { Preferences } from '@/src/features/interest/api';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { PreferenceKeys, usePreferenceOptionsQuery } from '@/src/features/interest/queries';
import type { AgeOptionData } from '@/src/features/interest/types';
import Layout from '@/src/features/layout';
import Loading from '@/src/features/loading';
import { environmentStrategy, platform } from '@/src/shared/libs';
import { PalePurpleGradient, Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Interest from '@features/interest';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';

const { ui, hooks, services } = Interest;
const { AgeSelector } = ui;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;

export default function AgeSelectionScreen() {
	const { t } = useTranslation();
	const { age, updateForm } = useInterestForm();
	const { updateStep } = useInterestStep();
	const [options, setOptions] = useState<AgeOptionData[]>([]);
	const {
		data: preferencesArray = [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
		isLoading: optionsLoading,
	} = usePreferenceOptionsQuery();

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === PreferenceKeys.AGE) ?? preferencesArray[0];

	useEffect(() => {
		if (preferences.typeName === '') {
			return;
		}

		const loaded = preferences.options.map((option) => {
			// Fallback: 백엔드 key 미적용 시 displayName으로 매핑
			const getKey = () => {
				if (option.key) {
					// NO_PREFERENCE를 NO_PREFERENCE로 유지 (번역 키가 있음)
					return option.key;
				}
				const mapping: Record<string, string> = {
					동갑: 'SAME_AGE',
					연하: 'YOUNGER',
					연상: 'OLDER',
					상관없음: 'ANY',
				};
				return mapping[option.displayName] || 'ANY';
			};

			const optionKey = getKey();

			return {
				value: option.id,
				label: t(`apps.interest.age.${optionKey.toLowerCase()}`),
				image: (() => {
					switch (optionKey) {
						case 'SAME_AGE':
							return require('@assets/images/age/same.png');
						case 'YOUNGER':
							return require('@assets/images/age/under.png');
						case 'OLDER':
							return require('@assets/images/age/high.png');
						default:
							return require('@assets/images/age/nothing.png');
					}
				})(),
			};
		}) as AgeOptionData[];

		setOptions(loaded);
	}, [preferences, t]);

	useFocusEffect(useCallback(() => updateStep(InterestSteps.AGE), [updateStep]));

	const onNext = () => {
		mixpanelAdapter.track('Interest_Age', { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
		router.push('/interest/like-mbti');
	};

	if (optionsLoading) {
		return <Loading.Page title={t('apps.interest.age.loading')} />;
	}

	return (
		<Layout.Default>
			<PalePurpleGradient />
			<View style={styles.contentContainer}>
				<Image
					source={require('@assets/images/peoples.png')}
					style={{ width: 81, height: 81, marginLeft: 28 }}
				/>
				<View style={styles.topContainer}>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.age.title_1')}
					</Text>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.age.title_2')}
					</Text>
				</View>
				<View style={styles.bar} />
				<View style={[styles.ageContainer]}>
					<AgeSelector options={options} value={age} onChange={(age) => updateForm('age', age)} />
				</View>

				<Layout.TwoButtons
					disabledNext={!age}
					onClickNext={onNext}
					onClickPrevious={() => {
						router.navigate('/interest');
					}}
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

		alignItems: 'center',
	},
	bar: {
		marginHorizontal: 32,

		height: 0.5,
		backgroundColor: semanticColors.surface.background,
		marginTop: 15,
		marginBottom: 30,
	},
});
