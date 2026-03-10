import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface CoupleCounterProps {
	count: number;
	label: string;
}

export function CoupleCounter({ count, label }: CoupleCounterProps) {
	const [displayCount, setDisplayCount] = useState(0);
	const prevCountRef = useRef(0);

	useEffect(() => {
		const start = prevCountRef.current;
		const end = count;
		const duration = 1000;
		const steps = 40;
		const stepDuration = duration / steps;
		let step = 0;

		const timer = setInterval(() => {
			step++;
			const progress = step / steps;
			// ease-out
			const eased = 1 - (1 - progress) * (1 - progress);
			const current = Math.round(start + (end - start) * eased);
			setDisplayCount(current);

			if (step >= steps) {
				clearInterval(timer);
				setDisplayCount(end);
				prevCountRef.current = end;
			}
		}, stepDuration);

		return () => clearInterval(timer);
	}, [count]);

	return (
		<View style={styles.container}>
			<Text style={styles.count}>{displayCount.toLocaleString()}</Text>
			<Text style={styles.label}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingVertical: 8,
	},
	count: {
		fontSize: 36,
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.brand.primary,
		letterSpacing: -1,
	},
	label: {
		fontSize: 13,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.muted,
		marginTop: 4,
	},
});
