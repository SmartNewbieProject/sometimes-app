import SmallTitle from '@/assets/icons/small-title.svg';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Text } from '@/src/shared/ui/text';
import React from 'react';
import { View } from 'react-native';

interface LogoProps {
	title?: string;
	showLogo?: boolean;
	logoSize?: number;
}

export function Logo({ title, showLogo = true, logoSize = 32 }: LogoProps) {
	return (
		<View className="flex-1 items-center justify-center">
			{showLogo ? (
				<IconWrapper width={logoSize} className="text-primaryPurple">
					<SmallTitle />
				</IconWrapper>
			) : (
				<Text size="lg" weight="bold" textColor="purple">
					{title || 'SOMETIME'}
				</Text>
			)}
		</View>
	);
}
