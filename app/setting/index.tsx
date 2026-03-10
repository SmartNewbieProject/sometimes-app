import { showLoggerOverlay } from '@/src/features/logger/service/logger-visibility';
import AccountMenu from '@/src/features/setting/ui/account-menu';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const REQUIRED_TAP_COUNT = 3;
const TAP_RESET_MS = 2000;

function Setting() {
	const version = Constants.expoConfig?.version ?? '';
	const tapCountRef = useRef(0);
	const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleVersionPress = () => {
		if (tapTimeoutRef.current) {
			clearTimeout(tapTimeoutRef.current);
		}

		tapCountRef.current += 1;

		if (tapCountRef.current >= REQUIRED_TAP_COUNT) {
			tapCountRef.current = 0;
			tapTimeoutRef.current = null;
			showLoggerOverlay();
			return;
		}

		tapTimeoutRef.current = setTimeout(() => {
			tapCountRef.current = 0;
			tapTimeoutRef.current = null;
		}, TAP_RESET_MS);
	};

	useEffect(() => {
		return () => {
			if (tapTimeoutRef.current) {
				clearTimeout(tapTimeoutRef.current);
			}
		};
	}, []);

	return (
		<View style={styles.container}>
			<AccountMenu />
			<View style={styles.versionContainer}>
				<Pressable hitSlop={12} onPress={handleVersionPress}>
					<Text style={styles.versionText}>버전 {version}</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
	},
	versionContainer: {
		marginTop: 8,
		paddingVertical: 12,
		alignItems: 'center',
	},
	versionText: {
		fontSize: 13,
		color: '#BAC1CB',
	},
});

export default Setting;
