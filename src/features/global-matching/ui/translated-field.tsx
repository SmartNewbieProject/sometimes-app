import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@shared/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, type TextStyle, TouchableOpacity, View } from 'react-native';

type TranslatedFieldProps = {
	translated: string;
	original: string;
	style?: TextStyle;
};

export const TranslatedField = ({ translated, original, style }: TranslatedFieldProps) => {
	const { t } = useTranslation();
	const [showOriginal, setShowOriginal] = useState(false);

	const isSame = translated === original;
	if (isSame) {
		return (
			<Text style={style} textColor="white" weight="light" size="md">
				{translated}
			</Text>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={style} textColor="white" weight="light" size="md">
				{showOriginal ? original : translated}
			</Text>
			<TouchableOpacity onPress={() => setShowOriginal(!showOriginal)} style={styles.toggleButton}>
				<Text style={styles.toggleText}>
					{showOriginal
						? t('features.global-matching.show_translated')
						: t('features.global-matching.show_original')}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	toggleButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 8,
	},
	toggleText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '500',
		fontFamily: 'Pretendard-Medium',
	},
});
