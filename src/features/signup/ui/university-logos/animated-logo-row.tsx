import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ImageSourcePropType, Platform, StyleSheet, View } from 'react-native';

export interface AnimatedLogoRowProps {
	row1Logos: ImageSourcePropType[];
	row2Logos: ImageSourcePropType[];
	logoSize?: number;
	accessibilityLabel?: string;
}

export default function AnimatedLogoRow({
	row1Logos,
	row2Logos,
	logoSize = 48,
	accessibilityLabel,
}: AnimatedLogoRowProps) {
	const { t } = useTranslation();
	const defaultAccessibilityLabel = t('common.대학교_로고');
	const finalAccessibilityLabel = accessibilityLabel ?? defaultAccessibilityLabel;

	const anim1 = useRef(new Animated.Value(0)).current;
	const anim2 = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const width = row1Logos.length * (logoSize + 8);

		anim1.setValue(0);
		Animated.loop(
			Animated.sequence([
				Animated.timing(anim1, {
					toValue: -width,
					duration: 25000,
					useNativeDriver: Platform.OS !== 'web',
					easing: Easing.linear,
				}),
				Animated.timing(anim1, {
					toValue: 0,
					duration: 0,
					useNativeDriver: Platform.OS !== 'web',
				}),
			]),
		).start();

		return () => anim1.stopAnimation();
	}, [anim1, logoSize, row1Logos.length]);

	useEffect(() => {
		const width = row2Logos.length * (logoSize + 8);

		anim2.setValue(-width);
		Animated.loop(
			Animated.sequence([
				Animated.timing(anim2, {
					toValue: 0,
					duration: 25000,
					useNativeDriver: Platform.OS !== 'web',
					easing: Easing.linear,
				}),
				Animated.timing(anim2, {
					toValue: -width,
					duration: 0,
					useNativeDriver: Platform.OS !== 'web',
				}),
			]),
		).start();

		return () => anim2.stopAnimation();
	}, [anim2, logoSize, row2Logos.length]);

	const logoWithMargin = logoSize + 8;

	return (
		<View style={styles.container}>
			<View style={styles.rowsContainer}>
				<View testID="logo-row-1" style={[styles.row, { height: logoWithMargin }]}>
					<Animated.View
						style={[
							styles.animatedRow,
							{
								transform: [{ translateX: anim1 }],
								width: row1Logos.length * logoWithMargin * 3,
							},
						]}
					>
						{[...row1Logos, ...row1Logos, ...row1Logos].map((logo, idx) => (
							<View
								key={`row1-${idx}`}
								style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
							>
								<Image
									source={logo}
									style={{ width: logoSize, height: logoSize }}
									contentFit="contain"
									accessibilityLabel={finalAccessibilityLabel}
									alt={finalAccessibilityLabel}
								/>
							</View>
						))}
					</Animated.View>
				</View>

				<View testID="logo-row-2" style={[styles.row, { height: logoWithMargin, marginTop: 12 }]}>
					<Animated.View
						style={[
							styles.animatedRow,
							{
								transform: [{ translateX: anim2 }],
								width: row2Logos.length * logoWithMargin * 3,
							},
						]}
					>
						{[...row2Logos, ...row2Logos, ...row2Logos].map((logo, idx) => (
							<View
								key={`row2-${idx}`}
								style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
							>
								<Image
									source={logo}
									style={{ width: logoSize, height: logoSize }}
									contentFit="contain"
									accessibilityLabel={finalAccessibilityLabel}
									alt={finalAccessibilityLabel}
								/>
							</View>
						))}
					</Animated.View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		position: 'relative',
		minHeight: 180,
		paddingVertical: 16,
	},
	rowsContainer: {
		width: '100%',
	},
	row: {
		overflow: 'hidden',
		width: '100%',
	},
	animatedRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logoContainer: {
		marginHorizontal: 4,
		justifyContent: 'center',
		alignItems: 'center',
		opacity: 0.9,
	},
});
