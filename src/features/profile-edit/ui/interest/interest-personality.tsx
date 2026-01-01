import type { Preferences } from '@/src/features/interest/api';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { PreferenceSelector } from '@/src/shared/ui';
import { StepIndicator } from '@/src/widgets';
import { useTranslation } from 'react-i18next';
import Interest from '@/src/features/interest';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function InterestPersonality() {
	const { personality, updateForm } = useInterestForm();
	const { t } = useTranslation();
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
		preferencesArray?.find((item) => item.typeCode === PreferenceKeys.PERSONALITY) ??
		preferencesArray[0];

	const onChangeOption = (values: string[]) => {
		if (values.length > 3) {
			return;
		}
		updateForm('personality', values);
	};

	return (
		<View style={styles.container}>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>{t('features.profile-edit.ui.interest.personality.title')}</Text>
				<StepIndicator
					length={3}
					step={personality?.length ?? 0}
					dotGap={4}
					dotSize={16}
					style={styles.stepIndicator}
				/>
			</View>
			<View style={styles.bar} />
			<View style={styles.chipSelector}>
				<PreferenceSelector
					preferences={preferences}
					value={personality}
					multiple={true}
					onChange={onChangeOption}
					isLoading={isLoading}
					loadingTitle={t('features.profile-edit.ui.interest.personality.loading')}
					style={{ width: '100%' }}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 30,
		paddingHorizontal: 28,
	},
	title: {
		color: colors.black,
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: 600,
		lineHeight: 22,
	},
	titleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	chipSelector: {
		marginTop: 16,
		width: '100%',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
	},
	bar: {
		marginTop: 6,
		marginBottom: 10,
		height: 0.5,
		backgroundColor: semanticColors.surface.other,
	},
	stepIndicator: {
		alignSelf: 'flex-end',
	},
});

export default InterestPersonality;
