import type React from 'react';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
	getLoggerVisibility,
	hideLoggerOverlay,
	subscribeLoggerVisibility,
} from '../service/logger-visibility';
import LoggerOverlay from './logger-overlay';

interface LoggerContainerProps {
	children: React.ReactNode;
}

function LoggerContainer({ children }: LoggerContainerProps) {
	if (!__DEV__ || Platform.OS === 'web') {
		return <>{children}</>;
	}

	const [isVisible, setIsVisible] = useState(getLoggerVisibility);

	useEffect(() => {
		return subscribeLoggerVisibility(setIsVisible);
	}, []);

	return (
		<View style={styles.root}>
			{children}
			<LoggerOverlay isVisible={isVisible} onClose={hideLoggerOverlay} />
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
});

export default LoggerContainer;
