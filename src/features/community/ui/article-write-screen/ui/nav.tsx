import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Check, Text } from '@/src/shared/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ArticleWriterForm } from '../../../hooks';

export const ArticleWriteNav = ({ mode }: { mode: 'create' | 'update' }) => {
	const { watch, setValue } = useFormContext<ArticleWriterForm>();
	const insets = useSafeAreaInsets();
	const anonymous = watch('anonymous');
	const { t } = useTranslation();

	const onToggleAnonymous = () => {
		setValue('anonymous', !anonymous);
	};

	return (
		<View style={[navStyles.container, { paddingBottom: insets.bottom }]}>
			<View style={navStyles.innerRow}>
				{mode === 'create' && (
					<Check.Box checked={anonymous} size={25} onChange={onToggleAnonymous}>
						<Text style={navStyles.anonymousText}>
							{t('features.community.ui.article_write_screen.nav.anonymous')}
						</Text>
					</Check.Box>
				)}
			</View>
		</View>
	);
};

const navStyles = StyleSheet.create({
	container: {
		backgroundColor: semanticColors.surface.background,
		borderTopWidth: 1,
		borderTopColor: colors.lightPurple,
		paddingHorizontal: 20,
		paddingTop: 16,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	innerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	anonymousText: {
		fontSize: 15,
		color: semanticColors.text.primary,
		fontWeight: '500',
	},
});
