import type { Preferences, PreferenceOption } from '@/src/features/interest/api';
import colors from '@/src/shared/constants/colors';
import type { TooltipData } from '@/src/shared/hooks/use-preference-tooltips';
import { PreferenceSlider, FormSection } from '@/src/shared/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PreferenceFieldProps {
	title: string;
	variant: 'interest' | 'profile';
	preferences: Preferences;
	value?: PreferenceOption;
	onChange: (option: PreferenceOption) => void;
	isLoading: boolean;
	loadingTitle: string;
	tooltips: TooltipData[];
	autoSetInitialValue?: boolean;
}

export function PreferenceField({
	title,
	variant,
	preferences,
	value,
	onChange,
	isLoading,
	loadingTitle,
	tooltips,
	autoSetInitialValue,
}: PreferenceFieldProps) {
	const slider = (
		<PreferenceSlider
			preferences={preferences}
			value={value}
			onChange={onChange}
			isLoading={isLoading}
			loadingTitle={loadingTitle}
			showTooltip={true}
			tooltips={tooltips}
			autoSetInitialValue={autoSetInitialValue}
		/>
	);

	if (variant === 'profile') {
		return (
			<FormSection title={title} showDivider={false} containerStyle={styles.profileContainer}>
				{slider}
			</FormSection>
		);
	}

	return (
		<View style={styles.interestContainer}>
			<Text style={styles.interestTitle}>{title}</Text>
			{slider}
		</View>
	);
}

const styles = StyleSheet.create({
	interestContainer: {
		paddingHorizontal: 28,
		marginBottom: 24,
	},
	interestTitle: {
		color: colors.black,
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: 600,
		lineHeight: 22,
	},
	profileContainer: {
		marginBottom: 24,
	},
});
