import React, { useEffect } from 'react';
import { semanticColors } from '../../constants/semantic-colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../hooks/use-toast';
import { Show } from '../show';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

function Toast() {
	const { toast, icon, dismissToast } = useToast();
	const insets = useSafeAreaInsets();

	const isVisible = useSharedValue(0);

	useEffect(() => {
		isVisible.value = toast ? 1 : 0;
	}, [toast]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: withSpring(isVisible.value ? 0 : 100, SPRING_CONFIG) },
		],
		opacity: withSpring(isVisible.value ? 1 : 0, SPRING_CONFIG),
	}));

	return (
		<Animated.View
			style={[
				styles.toastContainer,
				{ bottom: insets.bottom + 65 },
				animatedStyle,
			]}
			pointerEvents={toast ? 'auto' : 'none'}
		>
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={dismissToast}
				style={styles.toast}
			>
				<Show when={!!icon}>
					<View>{icon}</View>
				</Show>
				<Text style={[styles.toastText, !icon && styles.toastTextCenter]}>
					{toast}
				</Text>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	toastContainer: {
		position: 'absolute',
		width: '100%',
		paddingHorizontal: 16,
		justifyContent: 'center',
		flexDirection: 'row',
	},
	toast: {
		minHeight: 46,
		borderRadius: 15,
		backgroundColor: '#1D2939',
		paddingVertical: 11,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		width: '100%',
	},
	toastText: {
		flex: 1,
		fontSize: 20,
		lineHeight: 24,
		color: semanticColors.text.inverse,
	},
	toastTextCenter: {
		textAlign: 'center',
		paddingHorizontal: 54,
	},
});

export default Toast;
