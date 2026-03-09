import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { UniversityCard as UniversityCardProps } from '../../queries/use-universities';

function UniversityCard({
	item: { name, area, logoUrl },
	onClick,
	isSelected,
	compact = false,
}: {
	item: UniversityCardProps;
	onClick: () => void;
	isSelected: boolean;
	compact?: boolean;
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
			friction: 8,
			useNativeDriver: true,
		}).start();
	};

	const backgroundColor = isSelected || isPressed ? '#E6DBFF' : '#FFFFFF';
	const avatarSize = compact ? 24 : 32;

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
					compact && styles.containerCompact,
					{
						backgroundColor,
						borderColor: isSelected ? semanticColors.brand.primary : semanticColors.border.default,
						transform: [{ scale }],
					},
				]}
			>
				<View
					style={[
						styles.avatar,
						{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
					]}
				>
					{logoUrl && !logoError ? (
						<Image
							source={{ uri: logoUrl }}
							style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
							onError={() => setLogoError(true)}
						/>
					) : (
						<Text style={[styles.initialText, compact && styles.initialTextCompact]}>
							{name?.charAt(0) ?? '?'}
						</Text>
					)}
				</View>
				<View style={styles.nameRow}>
					<Text
						numberOfLines={1}
						ellipsizeMode="tail"
						style={[styles.title, compact && styles.titleCompact]}
					>
						{name}
					</Text>
				</View>
				<Text style={[styles.area, compact && styles.areaCompact]}>{area}</Text>
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
	containerCompact: {
		paddingVertical: 6,
		paddingHorizontal: 8,
		gap: 6,
		marginBottom: 2,
	},
	avatar: {
		backgroundColor: '#EDE5FF',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		overflow: 'hidden',
	},
	initialText: {
		fontSize: 10,
		fontWeight: '700',
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.brand.primary,
	},
	initialTextCompact: {
		fontSize: 8,
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
	titleCompact: {
		fontSize: 13,
	},
	area: {
		fontSize: 12,
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
		fontWeight: '400',
		flexShrink: 0,
	},
	areaCompact: {
		fontSize: 11,
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
