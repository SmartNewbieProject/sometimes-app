import { usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	type StyleProp,
	StyleSheet,
	View,
	type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENT_COLORS = ['#FFFFFF', '#F5F1FF'] as const;

type Props = {
	children: ReactNode;
	style?: StyleProp<ViewStyle>;
};

export const DefaultLayout = ({ children, style }: Props) => {
	const pathname = usePathname();
	const insets = useSafeAreaInsets();

	const keyboardVerticalOffset =
		Platform.OS === 'ios'
			? pathname.startsWith('/community') || pathname.startsWith('/auth/signup')
				? 0
				: 60
			: 0;

	if (Platform.OS === 'web') {
		return (
			<LinearGradient colors={[...GRADIENT_COLORS]} style={[styles.container, style]}>
				{children}
			</LinearGradient>
		);
	}

	return (
		<LinearGradient colors={[...GRADIENT_COLORS]} style={[styles.container, style]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={keyboardVerticalOffset}
				style={styles.keyboardView}
			>
				{children}
			</KeyboardAvoidingView>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
	keyboardView: {
		flex: 1,
	},
});
