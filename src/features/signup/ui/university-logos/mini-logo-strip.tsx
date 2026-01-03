import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageSourcePropType } from 'react-native';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

export interface MiniLogoStripProps {
	logos: ImageSourcePropType[];
	logoSize?: number;
	accessibilityLabel?: string;
}

export default function MiniLogoStrip({
	logos,
	logoSize = 32,
	accessibilityLabel,
}: MiniLogoStripProps) {
	const { t } = useTranslation();
	const defaultAccessibilityLabel = t('common.대학교_로고');
	const finalAccessibilityLabel = accessibilityLabel ?? defaultAccessibilityLabel;

	const anim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const width = logos.length * (logoSize + 8);

		anim.setValue(0);
		Animated.loop(
			Animated.timing(anim, {
				toValue: -width,
				duration: 20000,
				useNativeDriver: Platform.OS !== 'web',
				easing: Easing.linear,
			}),
		).start();

		return () => anim.stopAnimation();
	}, [anim, logoSize, logos.length]);

	const logoWithMargin = logoSize + 8;

	return (
		<View style={styles.container}>
			<View style={[styles.row, { height: logoWithMargin }]}>
				<Animated.View
					style={[
						styles.animatedRow,
						{
							transform: [{ translateX: anim }],
							width: logos.length * logoWithMargin * 3,
						},
					]}
				>
					{[...logos, ...logos, ...logos].map((logo, idx) => (
						<View
							// biome-ignore lint/suspicious/noArrayIndexKey: 무한 애니메이션용 반복 이미지
							key={`mini-logo-${idx}`}
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
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingVertical: 8,
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
		opacity: 0.85,
	},
});
