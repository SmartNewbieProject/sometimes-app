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

const SPRING_CONFIG = { damping: 18, stiffness: 180 };

function Toast() {
	const { toast, icon, dismissToast } = useToast();
	const insets = useSafeAreaInsets();

	const isVisible = useSharedValue(0);

	useEffect(() => {
		isVisible.value = toast ? 1 : 0;
	}, [toast]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: withSpring(isVisible.value ? 0 : -80, SPRING_CONFIG) },
		],
		opacity: withSpring(isVisible.value ? 1 : 0, SPRING_CONFIG),
	}));

	return (
		<Animated.View
			style={[
				styles.toastContainer,
				{ top: insets.top + 8 },
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
				<Text style={[styles.toastText, !icon && styles.toastTextCenter]} numberOfLines={1}>
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
		paddingHorizontal: 12,
		justifyContent: 'center',
		flexDirection: 'row',
	},
	toast: {
		borderRadius: 12,
		backgroundColor: '#1D2939',
		paddingVertical: 8,
		paddingHorizontal: 14,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		alignSelf: 'center',
		width: '100%',
	},
	toastText: {
		fontSize: 13,
		lineHeight: 18,
		color: semanticColors.text.inverse,
		flexShrink: 1,
	},
	toastTextCenter: {
		textAlign: 'center',
	},
});

export default Toast;
