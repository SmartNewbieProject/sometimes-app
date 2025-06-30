import { Text } from '@/src/shared/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface LeftButtonProps {
	onPress?: () => void;
	visible?: boolean;
}

export function LeftButton({ onPress, visible = false }: LeftButtonProps) {
	if (!visible) {
		return <View className="w-10" />;
	}

	return (
		<TouchableOpacity onPress={onPress}>
			<View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
				<Text size="md" weight="bold" textColor="purple">
					←
				</Text>
			</View>
		</TouchableOpacity>
	);
}
