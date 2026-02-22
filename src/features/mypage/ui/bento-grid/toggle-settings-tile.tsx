import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useMatchingFilters } from '@/src/features/mypage/hooks/use-matching-filter';
import { usePushNotification } from '@/src/features/mypage/hooks/use-push-notification';
import { useMissedNotificationCount } from '@/src/features/mypage/queries/use-missed-notification-count';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { getAndroidStoreUrl, getIOSStoreUrl, isWeb } from '@/src/shared/libs/platform-utils';
import { Text } from '@/src/shared/ui';
import { AppDownloadSection } from '@/src/shared/ui/app-download-section';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import CustomSwitch from '../custom-switch';

const ICON_BG = {
	department: '#FEF3F2',
	university: '#FFFAEB',
	push: '#F9F5FF',
	pushOff: '#FEF3F2',
};

const DepartmentIcon = () => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#F04438" opacity={0.85} />
		<Path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#F04438" opacity={0.6} />
	</Svg>
);

const UniversityIcon = () => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path d="M12 2L2 7h20L12 2z" fill="#F79009" opacity={0.85} />
		<Path d="M4 9v8h2V9H4zm6 0v8h2V9h-2zm6 0v8h2V9h-2z" fill="#F79009" opacity={0.7} />
		<Path d="M2 19h20v2H2v-2z" fill="#F79009" opacity={0.5} />
	</Svg>
);

const BellIcon = ({ off }: { off?: boolean }) => (
	<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 2C10.34 2 9 3.34 9 5v.29C6.12 6.4 4 9.18 4 12.5V17l-2 2v1h20v-1l-2-2v-4.5c0-3.32-2.12-6.1-5-7.21V5c0-1.66-1.34-3-3-3z"
			fill={off ? '#F04438' : '#7A4AE2'}
			opacity={0.7}
		/>
		<SvgCircle cx={12} cy={22} r={2} fill={off ? '#F04438' : '#7A4AE2'} opacity={0.5} />
	</Svg>
);

const SAMPLE_IMAGES = {
	MALE: [
		require('@/assets/images/samples/man/man_0.webp'),
		require('@/assets/images/samples/man/man_1.webp'),
		require('@/assets/images/samples/man/man_2.webp'),
	],
	FEMALE: [
		require('@/assets/images/samples/girl/girl_0.webp'),
		require('@/assets/images/samples/girl/girl_1.webp'),
		require('@/assets/images/samples/girl/girl_2.webp'),
	],
};

const MISSED_ITEMS = [
	{ key: 'matching', emoji: '💜' },
	{ key: 'likes', emoji: '❤️' },
	{ key: 'messages', emoji: '💬' },
] as const;

const NOTIF_PREVIEWS = [
	{
		i18nKey: 'features.mypage.missed_notification.web_notif_match',
		timeKey: 'features.mypage.missed_notification.web_time_min',
		time: 2,
	},
	{
		i18nKey: 'features.mypage.missed_notification.web_notif_like',
		timeKey: 'features.mypage.missed_notification.web_time_min',
		time: 15,
	},
	{
		i18nKey: 'features.mypage.missed_notification.web_notif_message',
		timeKey: 'features.mypage.missed_notification.web_time_hour',
		time: 1,
	},
] as const;

// --- Web: CSS keyframe injection ---
const NOTIF_ANIM_ID = 'notif-preview-animations';
const injectNotifAnimations = () => {
	if (Platform.OS !== 'web') return;
	if (document.getElementById(NOTIF_ANIM_ID)) return;
	const el = document.createElement('style');
	el.id = NOTIF_ANIM_ID;
	el.textContent = `
		@keyframes notifSlideIn {
			from { opacity: 0; transform: translateY(12px) scale(0.96); }
			to   { opacity: 1; transform: translateY(0) scale(1); }
		}
	`;
	document.head.appendChild(el);
};

// --- Native: Reanimated lazy require ---
let ReanimatedView: React.ComponentType<{
	style: Record<string, unknown>;
	children: React.ReactNode;
}> | null = null;
let useNativeNotifAnim:
	| ((index: number, isFaded: boolean, started: boolean) => Record<string, unknown>)
	| null = null;

if (Platform.OS !== 'web') {
	const Reanimated = require('react-native-reanimated');
	const { useSharedValue, useAnimatedStyle, withDelay, withTiming } = Reanimated;
	ReanimatedView = Reanimated.default.View;

	useNativeNotifAnim = (index: number, isFaded: boolean, started: boolean) => {
		const opacity = useSharedValue(0);
		const translateY = useSharedValue(12);
		const scale = useSharedValue(0.96);

		useEffect(() => {
			if (!started) return;
			const delay = index * 300;
			opacity.value = withDelay(delay, withTiming(isFaded ? 0.5 : 1, { duration: 400 }));
			translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
			scale.value = withDelay(delay, withTiming(1, { duration: 400 }));
		}, [started, index, isFaded, opacity, translateY, scale]);

		return useAnimatedStyle(() => ({
			opacity: opacity.value,
			transform: [{ translateY: translateY.value }, { scale: scale.value }],
		}));
	};
}

function AnimatedNotifCard({
	index,
	isFaded,
	started,
	children,
}: { index: number; isFaded: boolean; started: boolean; children: React.ReactNode }) {
	const animStyle = useNativeNotifAnim?.(index, isFaded, started);
	return <ReanimatedView style={animStyle}>{children}</ReanimatedView>;
}

export const ToggleSettingsTile = () => {
	const { t } = useTranslation();
	const { my } = useAuth();
	const { filters, isUpdating, toggleAvoidDepartment, toggleAvoidUniversity } =
		useMatchingFilters();
	const { isEnabled, toggle: togglePush } = usePushNotification();
	const pushOff = isWeb || !isEnabled;
	const { data: missedCount } = useMissedNotificationCount(!pushOff);

	const hasMissed = !isWeb && pushOff && (missedCount?.total ?? 0) > 0;
	const showPanel = pushOff;

	const oppositeGender =
		my?.gender === 'MALE' ? 'FEMALE' : my?.gender === 'FEMALE' ? 'MALE' : 'FEMALE';
	const sampleImages = SAMPLE_IMAGES[oppositeGender];

	const [animStarted, setAnimStarted] = useState(false);
	const panelRef = useRef<View>(null);

	useEffect(() => {
		if (showPanel) injectNotifAnimations();
	}, [showPanel]);

	// Web: IntersectionObserver로 뷰포트 진입 감지
	const panelRefCallback = useCallback(
		(node: View | null) => {
			panelRef.current = node;
			if (!node || !isWeb || !showPanel) return;
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						setAnimStarted(true);
						observer.disconnect();
					}
				},
				{ threshold: 0.2 },
			);
			observer.observe(node as unknown as Element);
		},
		[showPanel],
	);

	// Native: 패널 마운트 시 트리거
	useEffect(() => {
		if (!isWeb && showPanel) setAnimStarted(true);
	}, [showPanel]);

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<View style={[styles.iconWrap, { backgroundColor: ICON_BG.department }]}>
					<DepartmentIcon />
				</View>
				<View style={styles.textWrap}>
					<Text style={styles.label}>{t('features.mypage.ex_same_class')}</Text>
					<Text style={styles.desc}>{t('features.mypage.toggle_desc.department')}</Text>
				</View>
				<CustomSwitch
					value={filters?.avoidDepartment || false}
					onChange={toggleAvoidDepartment}
					disabled={isUpdating}
				/>
			</View>
			<View style={styles.divider} />
			<View style={styles.row}>
				<View style={[styles.iconWrap, { backgroundColor: ICON_BG.university }]}>
					<UniversityIcon />
				</View>
				<View style={styles.textWrap}>
					<Text style={styles.label}>{t('features.mypage.ex_same_school')}</Text>
					<Text style={styles.desc}>{t('features.mypage.toggle_desc.university')}</Text>
				</View>
				<CustomSwitch
					value={filters?.avoidUniversity || false}
					onChange={toggleAvoidUniversity}
					disabled={isUpdating}
				/>
			</View>
			<View style={styles.divider} />
			<View style={styles.row}>
				<View
					style={[styles.iconWrap, { backgroundColor: hasMissed ? ICON_BG.pushOff : ICON_BG.push }]}
				>
					<BellIcon off={hasMissed} />
				</View>
				<View style={styles.textWrap}>
					<View style={styles.labelRow}>
						<Text style={[styles.label, hasMissed && styles.labelOff]}>
							{t('features.mypage.notification.push_notification')}
						</Text>
						{hasMissed && (
							<View style={styles.missedBadge}>
								<Text style={styles.missedBadgeText}>
									{t('features.mypage.missed_notification.badge', { count: missedCount?.total })}
								</Text>
							</View>
						)}
					</View>
					<Text style={styles.desc}>{t('features.mypage.toggle_desc.push')}</Text>
				</View>
				<CustomSwitch value={!pushOff} onChange={togglePush} disabled={isWeb} />
			</View>

			{showPanel && (
				<View ref={panelRefCallback} style={[styles.missedPanel, isWeb && styles.webPanel]}>
					{hasMissed &&
						MISSED_ITEMS.map(({ key, emoji }) => {
							const count = missedCount?.[key] ?? 0;
							if (count === 0) return null;
							return (
								<View key={key} style={styles.missedRow}>
									<Text style={styles.missedEmoji}>{emoji}</Text>
									<Text style={styles.missedItemText}>
										{t(`features.mypage.missed_notification.${key}`)}
									</Text>
									<Text style={styles.missedItemCount}>{count}</Text>
								</View>
							);
						})}

					<View style={styles.webHeader}>
						<Text style={styles.webHeaderTitle}>
							{t('features.mypage.missed_notification.web_header')}
						</Text>
						<View style={styles.webTag}>
							<Text style={styles.webTagText}>
								{t('features.mypage.missed_notification.web_tag')}
							</Text>
						</View>
					</View>

					{NOTIF_PREVIEWS.map((item, index) => {
						const isFaded = index === NOTIF_PREVIEWS.length - 1;
						const card = (
							<View style={styles.notifItem}>
								<Image source={sampleImages[index]} style={styles.notifAvatar} />
								<Text style={styles.notifText}>{t(item.i18nKey)}</Text>
								<Text style={styles.notifTime}>{t(item.timeKey, { count: item.time })}</Text>
							</View>
						);

						if (isWeb) {
							return (
								<View
									key={item.i18nKey}
									style={[
										animStarted && styles.notifSlideIn,
										// @ts-ignore - web CSS properties
										animStarted && { animationDelay: `${index * 0.3}s` },
										!animStarted && { opacity: 0 },
										isFaded && animStarted && { opacity: 0.5 },
									]}
								>
									{card}
								</View>
							);
						}

						if (ReanimatedView && useNativeNotifAnim) {
							return (
								<AnimatedNotifCard
									key={item.i18nKey}
									index={index}
									isFaded={isFaded}
									started={animStarted}
								>
									{card}
								</AnimatedNotifCard>
							);
						}

						return (
							<View key={item.i18nKey} style={isFaded ? { opacity: 0.5 } : undefined}>
								{card}
							</View>
						);
					})}

					{isWeb ? (
						<View style={styles.downloadSection}>
							<Pressable
								style={styles.downloadRow}
								onPress={() => Linking.openURL(getIOSStoreUrl())}
							>
								<Text style={styles.downloadText}>
									{t('features.mypage.missed_notification.web_download')}
								</Text>
								<Text style={styles.downloadArrow}>→</Text>
							</Pressable>

							<AppDownloadSection
								size="sm"
								showTooltip={false}
								onAppStorePress={() => Linking.openURL(getIOSStoreUrl())}
								onGooglePlayPress={() => Linking.openURL(getAndroidStoreUrl())}
							/>
						</View>
					) : (
						<Pressable style={styles.missedCta} onPress={togglePush}>
							<Text style={styles.missedCtaText}>
								{t('features.mypage.missed_notification.cta')}
							</Text>
						</Pressable>
					)}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		gap: 10,
	},
	iconWrap: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
	},
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	label: {
		fontSize: 14,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	labelOff: {
		color: '#F04438',
	},
	desc: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		marginTop: 2,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: semanticColors.border.smooth,
	},
	missedBadge: {
		backgroundColor: '#FEF3F2',
		borderRadius: 10,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	missedBadgeText: {
		fontSize: 11,
		color: '#F04438',
		fontFamily: 'Pretendard-SemiBold',
	},
	webPanel: {
		backgroundColor: '#F9F5FF',
	},
	missedPanel: {
		backgroundColor: '#FEF3F2',
		borderRadius: 12,
		padding: 10,
		marginTop: 4,
		gap: 4,
	},
	missedRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	missedEmoji: {
		fontSize: 14,
		width: 20,
		textAlign: 'center',
	},
	missedItemText: {
		flex: 1,
		fontSize: 13,
		color: '#344054',
		fontFamily: 'Pretendard-Regular',
	},
	missedItemCount: {
		fontSize: 13,
		color: '#F04438',
		fontFamily: 'Pretendard-SemiBold',
	},
	missedCta: {
		backgroundColor: '#7A4AE2',
		borderRadius: 8,
		paddingVertical: 10,
		alignItems: 'center',
		marginTop: 4,
	},
	missedCtaText: {
		fontSize: 13,
		color: '#FFFFFF',
		fontFamily: 'Pretendard-SemiBold',
	},
	webHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	webHeaderTitle: {
		fontSize: 12,
		fontFamily: 'Pretendard-Bold',
		color: '#7A4AE2',
	},
	webTag: {
		backgroundColor: '#E2D5FF',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	webTagText: {
		fontSize: 10,
		fontFamily: 'Pretendard-SemiBold',
		color: '#7A4AE2',
	},
	notifItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#F2EDFF',
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginBottom: 3,
		gap: 8,
	},
	notifAvatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
	},
	notifSlideIn: {
		// @ts-ignore - web CSS properties
		animationName: 'notifSlideIn',
		animationDuration: '0.4s',
		animationFillMode: 'both',
		animationTimingFunction: 'ease-out',
	},
	notifText: {
		flex: 1,
		fontSize: 12,
		fontFamily: 'Pretendard-Medium',
		color: '#191F28',
	},
	notifTime: {
		fontSize: 10,
		fontFamily: 'Pretendard-Regular',
		color: '#AEAEAE',
	},
	downloadSection: {
		alignItems: 'center',
	},
	downloadRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 4,
		marginTop: 2,
		marginBottom: 2,
	},
	downloadText: {
		fontSize: 12,
		fontFamily: 'Pretendard-SemiBold',
		color: '#7A4AE2',
	},
	downloadArrow: {
		fontSize: 12,
		color: '#7A4AE2',
	},
});
