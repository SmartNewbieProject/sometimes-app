import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function MyProfilePreviewLayout() {
	return (
		<View style={styles.container}>
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
});
