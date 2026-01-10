import { Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

interface SometimeLogoProps {
	showSubtitle?: boolean;
}

export function SometimeLogo({ showSubtitle = true }: SometimeLogoProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Image
				source={require('@assets/images/sometime-logo.png')}
				style={styles.logo}
				resizeMode="contain"
			/>
			{showSubtitle && (
				<Text size="16" weight="medium" style={styles.subtitle}>
					{t('features.signup.ui.login_form.sometime_subtitle')}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		gap: 16,
		marginBottom: 0,
	},
	logo: {
		width: 262,
		height: 35,
	},
	subtitle: {
		color: '#AD91EA',
		textAlign: 'center',
	},
});
