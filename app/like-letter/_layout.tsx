import type { Href } from 'expo-router';
import { Slot, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';
import { Header, Text } from '@/src/shared/ui';
import Layout from '@/src/features/layout';

export default function LikeLetterLayout() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();

	const handleBack = () => {
		if (redirectTo) {
			router.replace(decodeURIComponent(redirectTo) as Href);
		} else {
			router.back();
		}
	};

	return (
		<Layout.Default style={styles.container}>
			<Header.Container style={styles.headerContainer}>
				<Header.LeftContent>
					<Pressable onPress={handleBack} style={styles.arrowContainer}>
						<View style={styles.backArrow} />
					</Pressable>
				</Header.LeftContent>
				<Header.CenterContent>
					<Text size="lg" weight="bold" textColor="black">
						편지 작성하기
					</Text>
				</Header.CenterContent>
				<Header.RightContent>
					<View style={{ width: 24 }} />
				</Header.RightContent>
			</Header.Container>

			<View style={[styles.content, { paddingBottom: insets.bottom }]}>
				<Slot />
			</View>
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	headerContainer: {
		alignItems: 'center',
	},
	content: {
		flex: 1,
	},
	backArrow: {
		width: 12.6,
		height: 12.6,
		top: 3,
		left: 3,
		position: 'absolute',
		borderLeftWidth: 2,
		borderLeftColor: '#000',
		borderTopWidth: 2,
		borderTopColor: '#000',
		transform: [{ rotate: '-45deg' }],
		borderRadius: 2,
	},
	arrowContainer: {
		width: 24,
		height: 24,
	},
});
