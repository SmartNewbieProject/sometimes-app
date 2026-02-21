import { Stack } from 'expo-router';

export default function IdealTypeTestLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="questions" />
			<Stack.Screen name="result" />
		</Stack>
	);
}
