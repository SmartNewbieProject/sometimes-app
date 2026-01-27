import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { PROFILE_VIEWER_KEYS } from '@/src/shared/libs/locales/keys';
import { Header, Text } from '@/src/shared/ui';
import ChevronLeftIcon from '@assets/icons/chevron-left.svg';
import { useCurrentGem } from '@features/payment/hooks';
import { ImageResources } from '@shared/libs';
import { ImageResource } from '@ui/image-resource';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

export default function ViewedMeLayoutScreen() {
	const router = useRouter();
	const { data: gem } = useCurrentGem();
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Header.Container style={styles.headerContainer}>
				<Header.LeftContent>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<ChevronLeftIcon width={24} height={24} />
					</Pressable>
				</Header.LeftContent>
				<Header.CenterContent style={styles.centerContent}>
					<Text textColor="black" size="20" weight="bold">
						{t(PROFILE_VIEWER_KEYS.viewedMeHeaderTitle)}
					</Text>
				</Header.CenterContent>
				<Header.RightContent>
					<Pressable onPress={() => router.push('/purchase/gem-store')} style={styles.gemContainer}>
						<Text numberOfLines={1} textColor="black" size="13" style={styles.gemCount}>
							{gem?.totalGem ?? 0}
							{t('apps.matching_history.gem_unit')}
						</Text>
						<ImageResource resource={ImageResources.GEM} width={28} height={28} />
					</Pressable>
				</Header.RightContent>
			</Header.Container>
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						headerShown: false,
						contentStyle: {
							backgroundColor: semanticColors.surface.background,
						},
						animation: 'slide_from_right',
					}}
				/>
			</Stack>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerContainer: {
		borderBottomWidth: 1,
		borderBottomColor: '#E7E9EC',
		alignItems: 'center',
	},
	backButton: {
		paddingTop: 8,
		marginLeft: -8,
	},
	centerContent: {
		paddingTop: 8,
	},
	gemContainer: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 9,
		position: 'absolute',
		right: 0,
		top: -11,
		gap: 5,
		paddingVertical: 1,
		minWidth: 64,
		alignItems: 'center',
		flexWrap: 'nowrap',
	},
	gemCount: {
		lineHeight: 22,
		flexShrink: 0,
	},
});
