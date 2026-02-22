import React, { type ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContainerProps {
	children: ReactNode;
	style?: StyleProp<ViewStyle>;
	centered?: boolean;
}

export function Container({ children, centered = false, style }: ContainerProps) {
	const insets = useSafeAreaInsets();
	return <View style={[styles.container, { paddingTop: insets.top + 12 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 12,
		backgroundColor: 'transparent',
	},
});
