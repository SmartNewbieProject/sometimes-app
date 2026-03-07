import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { UniversityCard as UniversityCardProps } from '../../queries/use-universities';

const FOUNDATION_BADGE: Record<string, { label: string; bg: string; text: string }> = {
	NATIONAL: { label: '국립', bg: '#E8F4FD', text: '#1A6FA8' },
	PUBLIC: { label: '공립', bg: '#E8F4FD', text: '#1A6FA8' },
	PRIVATE: { label: '사립', bg: '#FFF0E6', text: '#C05A00' },
};

function UniversityCard({
	item: { name, area, logoUrl, universityType },
	onClick,
	isSelected,
}: {
	item: UniversityCardProps;
	onClick: () => void;
	isSelected: boolean;
}) {
	const [logoError, setLogoError] = useState(false);
	const [isPressed, setIsPressed] = useState(false);
	const scale = useRef(new Animated.Value(1)).current;

	const onPressIn = () => {
		setIsPressed(true);
		Animated.spring(scale, {
			toValue: 0.97,
			useNativeDriver: true,
		}).start();
	};

	const onPressOut = () => {
		setIsPressed(false);
		Animated.spring(scale, {
			toValue: 1,
			friction: 3,
			useNativeDriver: true,
		}).start();
	};

	const backgroundColor = isSelected || isPressed ? '#E6DBFF' : '#FFFFFF';

	return (
		<Pressable
			testID={`university-card-${name}`}
			onPress={onClick}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
		>
			<Animated.View
				style={[
					styles.container,
					{
						backgroundColor,
						borderColor: isSelected ? semanticColors.brand.primary : semanticColors.border.default,
						transform: [{ scale }],
					},
				]}
			>
				<View style={styles.avatar}>
					{logoUrl && !logoError ? (
						<Image
							source={{ uri: logoUrl }}
							style={styles.logoImage}
							onError={() => setLogoError(true)}
						/>
					) : (
						<Text style={styles.initialText}>{name?.charAt(0) ?? '?'}</Text>
					)}
				</View>
				<View style={styles.nameRow}>
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
						{name}
					</Text>
					{universityType && FOUNDATION_BADGE[universityType] && (
						<View
							style={[
								styles.badge,
								{ backgroundColor: FOUNDATION_BADGE[universityType].bg },
							]}
						>
							<Text style={[styles.badgeText, { color: FOUNDATION_BADGE[universityType].text }]}>
								{FOUNDATION_BADGE[universityType].label}
							</Text>
						</View>
					)}
				</View>
				<Text style={styles.area}>{area}</Text>
				{isSelected && <View style={styles.dot} />}
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingVertical: 10,
		paddingHorizontal: 10,
		flexDirection: 'row',
		gap: 7,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		borderRadius: 8,
		marginBottom: 4,
		alignItems: 'center',
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#EDE5FF',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		overflow: 'hidden',
	},
	logoImage: {
		width: 32,
		height: 32,
		borderRadius: 16,
	},
	initialText: {
		fontSize: 10,
		fontWeight: '700',
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.brand.primary,
	},
	nameRow: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		overflow: 'hidden',
	},
	title: {
		flexShrink: 1,
		color: semanticColors.text.primary,
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
	badge: {
		paddingHorizontal: 4,
		paddingVertical: 1,
		borderRadius: 3,
		flexShrink: 0,
	},
	badgeText: {
		fontSize: 9,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
	area: {
		fontSize: 12,
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
		fontWeight: '400',
		flexShrink: 0,
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: semanticColors.brand.primary,
		flexShrink: 0,
	},
});

export default UniversityCard;
