import type { Preferences } from '@/src/features/interest/api';
import { PreferenceKeys, usePreferenceOptionsQuery } from '@/src/features/interest/queries';
import type { AgeOptionData, AgeOptionType } from '@/src/features/interest/types';
import Layout from '@/src/features/layout';
import Loading from '@/src/features/loading';
import { PalePurpleGradient, Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Interest from '@features/interest';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
			const getKey = () => {
				if (option.key) {
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

			const getType = (): AgeOptionType => {
				switch (optionKey) {
					case 'SAME_AGE':
						return 'SAME_AGE';
					case 'YOUNGER':
						return 'YOUNGER';
					case 'OLDER':
						return 'OLDER';
					default:
						return 'ANY';
				}
			};

			return {
				value: option.id,
				label: t(`apps.interest.age.${optionKey.toLowerCase()}`),
				type: getType(),
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
					source={require('@assets/images/age/cake-character.png')}
					style={styles.characterImage}
				/>
				<View style={styles.topContainer}>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.age.title_1')}
					</Text>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.age.title_2')}
					</Text>
				</View>
				<View style={styles.ageContainer}>
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
		marginHorizontal: 30,
		marginTop: 15,
	},
	contentContainer: {
		flex: 1,
	},
	characterImage: {
		width: 74,
		height: 85,
		marginLeft: 30,
	},
	ageContainer: {
		flex: 1,
		alignItems: 'center',
		marginTop: 30,
	},
});
