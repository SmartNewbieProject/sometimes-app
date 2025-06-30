import { Text } from '@/src/shared/ui';
import { StyleSheet, View } from 'react-native';

type SizeType = 'sm' | 'md';

interface TimeProps {
	value: string;
	size?: SizeType;
}

export default function Time({ value, size = 'md' }: TimeProps) {
	return (
		<View style={[styles.container, styles[size]]}>
			<Text
				weight="bold"
				className={
					size === 'md'
						? 'text-[23px] text-primaryPurple font-rubik'
						: 'text-[18px] text-primaryPurple font-rubik'
				}
			>
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		borderRadius: 8,
		textAlign: 'center',
		fontFamily: 'Rubik',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	md: {
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	sm: {
		paddingHorizontal: 8,
		paddingVertical: 5,
	},
});
