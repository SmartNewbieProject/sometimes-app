import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { getSmartUnivLogoUrl } from '@/src/shared/libs/univ';
import { Text } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from 'react-native';
import type { ClusterUniversity } from '../../constants/mock-region-stats';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const IS_SMALL = SCREEN_HEIGHT < 700;
const CIRCLE_SIZE = IS_SMALL ? 52 : 68;
const ITEM_WIDTH = IS_SMALL ? 60 : 76;
const ITEM_GAP = 12;
const ITEM_TOTAL = ITEM_WIDTH + ITEM_GAP;

interface ClusterCircleRowProps {
	universities: ClusterUniversity[];
	myUnivCode: string;
}

function UnivCircle({ univ, isMine }: { univ: ClusterUniversity; isMine: boolean }) {
	const [imgError, setImgError] = useState(false);
	const logoUrl = getSmartUnivLogoUrl(univ.code, 'kr');
	const shortName = univ.name.replaceAll('학교', '');

	return (
		<View style={circleStyles.item}>
			<View style={circleStyles.imageOuter}>
				<View
					style={[
						circleStyles.imageWrapper,
						isMine ? circleStyles.imageWrapperMine : circleStyles.imageWrapperOther,
					]}
				>
					{imgError || !logoUrl ? (
						<View style={circleStyles.fallback}>
							<Text style={circleStyles.fallbackText}>{univ.name[0]}</Text>
						</View>
					) : (
						<Image
							source={{ uri: logoUrl }}
							style={circleStyles.image}
							contentFit="cover"
							onError={() => setImgError(true)}
						/>
					)}
				</View>
				<View style={circleStyles.badge}>
					<Text style={circleStyles.badgeText}>{univ.matchCount.toLocaleString()}쌍</Text>
				</View>
			</View>
			<Text style={circleStyles.name} numberOfLines={1}>
				{shortName}
			</Text>
		</View>
	);
}

export function ClusterCircleRow({ universities, myUnivCode }: ClusterCircleRowProps) {
	const mid = Math.ceil(universities.length / 2);
	const row1 = universities.slice(0, mid);
	const row2 = universities.slice(mid);

	const anim1 = useRef(new Animated.Value(0)).current;
	const anim2 = useRef(new Animated.Value(0)).current;

	const row1Width = row1.length * ITEM_TOTAL;
	const row2Width = row2.length * ITEM_TOTAL;

	useEffect(() => {
		anim1.setValue(0);
		const a = Animated.loop(
			Animated.sequence([
				Animated.timing(anim1, {
					toValue: -row1Width,
					duration: row1.length * 3000,
					useNativeDriver: Platform.OS !== 'web',
					easing: Easing.linear,
				}),
				Animated.timing(anim1, { toValue: 0, duration: 1, useNativeDriver: Platform.OS !== 'web' }),
			]),
		);
		a.start();
		return () => anim1.stopAnimation();
	}, [anim1, row1Width, row1.length]);

	useEffect(() => {
		anim2.setValue(0);
		const a = Animated.loop(
			Animated.sequence([
				Animated.timing(anim2, {
					toValue: row2Width,
					duration: row2.length * 3000,
					useNativeDriver: Platform.OS !== 'web',
					easing: Easing.linear,
				}),
				Animated.timing(anim2, { toValue: 0, duration: 1, useNativeDriver: Platform.OS !== 'web' }),
			]),
		);
		a.start();
		return () => anim2.stopAnimation();
	}, [anim2, row2Width, row2.length]);

	return (
		<View style={circleStyles.container}>
			<View style={circleStyles.row}>
				<Animated.View
					style={[
						circleStyles.animatedRow,
						{ transform: [{ translateX: anim1 }], width: row1Width * 3 },
					]}
				>
					{[...row1, ...row1, ...row1].map((univ, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: marquee duplicated items
						<UnivCircle key={`r1-${idx}`} univ={univ} isMine={univ.code === myUnivCode} />
					))}
				</Animated.View>
			</View>
			<View style={[circleStyles.row, { marginTop: 12 }]}>
				<Animated.View
					style={[
						circleStyles.animatedRow,
						{ transform: [{ translateX: anim2 }], left: -row2Width, width: row2Width * 3 },
					]}
				>
					{[...row2, ...row2, ...row2].map((univ, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: marquee duplicated items
						<UnivCircle key={`r2-${idx}`} univ={univ} isMine={univ.code === myUnivCode} />
					))}
				</Animated.View>
			</View>
		</View>
	);
}

const circleStyles = StyleSheet.create({
	container: {
		width: '100%',
		marginTop: 24,
		paddingTop: 10,
		paddingBottom: 4,
		overflow: 'hidden',
	},
	row: {
		overflow: 'visible',
		width: '100%',
	},
	animatedRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: ITEM_GAP,
	},
	item: {
		alignItems: 'center',
		width: ITEM_WIDTH,
	},
	imageOuter: {
		position: 'relative',
	},
	imageWrapper: {
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		borderRadius: CIRCLE_SIZE / 2,
		overflow: 'hidden',
		backgroundColor: semanticColors.surface.surface,
	},
	imageWrapperMine: {
		borderWidth: 3,
		borderColor: semanticColors.brand.primary,
	},
	imageWrapperOther: {
		borderWidth: 1,
		borderColor: semanticColors.border.card,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	fallback: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: semanticColors.surface.tertiary,
	},
	fallbackText: {
		fontSize: 18,
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.brand.primary,
	},
	badge: {
		position: 'absolute',
		top: -8,
		right: -8,
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 10,
		paddingHorizontal: 6,
		paddingVertical: 2,
		minWidth: 28,
		alignItems: 'center',
	},
	badgeText: {
		fontSize: 9,
		fontFamily: 'Pretendard-Bold',
		color: '#FFFFFF',
	},
	name: {
		fontSize: 10,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.secondary,
		marginTop: 4,
		textAlign: 'center',
	},
});
