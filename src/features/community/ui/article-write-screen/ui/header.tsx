import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { Header, Text } from '@shared/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';

type ArticleWriteHeaderProps = {
	onConfirm: () => void;
	mode: 'create' | 'update';
	disabled?: boolean;
	confirmLabel?: string;
};

export const ArticleWriteHeader = ({
	onConfirm,
	mode,
	disabled = false,
	confirmLabel,
}: ArticleWriteHeaderProps) => {
	const { t } = useTranslation();
	return (
		<Header.Container>
			<Header.LeftContent>
				<Pressable
					disabled={disabled}
					onPress={() => router.push('/community')}
					style={[headerStyles.backButton, disabled && headerStyles.disabledButton]}
				>
					<ChevronLeftIcon width={24} height={24} />
				</Pressable>
			</Header.LeftContent>

			<Header.CenterContent>
				<Text textColor="black" weight="bold" size="18">
					{mode === 'create'
						? t('features.community.ui.article_write_screen.header.write_post')
						: t('features.community.ui.article_write_screen.header.edit_post')}
				</Text>
			</Header.CenterContent>

			<Header.RightContent>
				<TouchableOpacity disabled={disabled} onPress={onConfirm}>
					<Text textColor={'black'} weight={'bold'}>
						{confirmLabel ??
							t('features.community.ui.article_write_screen.header.complete_button')}
					</Text>
				</TouchableOpacity>
			</Header.RightContent>
		</Header.Container>
	);
};

const headerStyles = StyleSheet.create({
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	disabledButton: {
		opacity: 0.5,
	},
});
