import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { Text } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

interface RevealConfirmContentProps {
	cost: number;
	isFree?: boolean;
}

export const RevealConfirmContent = ({ cost, isFree = false }: RevealConfirmContentProps) => {
	const { t } = useTranslation();

	if (isFree) {
		return (
			<View style={styles.container}>
				<Text textColor="primary" size="18" weight="semibold">
					{t(PROFILE_VIEWER_KEYS.revealConfirmFreeLabel)}
				</Text>
				<Text textColor="muted" size="14">
					{t(PROFILE_VIEWER_KEYS.revealConfirmFreeInfo)}
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.gemRow}>
				<Image source={require('@assets/images/gem-icon.webp')} style={styles.gemIcon} />
				<Text textColor="black" size="18" weight="semibold">
					x {cost}
				</Text>
			</View>
			<Text textColor="muted" size="14">
				{t(PROFILE_VIEWER_KEYS.revealConfirmCostInfo, { cost })}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		gap: 12,
	},
	gemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	gemIcon: {
		width: 32,
		height: 32,
	},
});
