import { dayUtils } from '@/src/shared/libs';
import { IconWrapper } from '@/src/shared/ui/icons';
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { Text } from '@/src/shared/ui/text';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Time from './time';
import { useAuth } from '../../auth';
import { type TimeResult, calculateTime } from '../services/calculate-time';
import type { MatchDetails } from '../types';
import { sideStyle } from './constants';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/shared/libs/i18n';

interface WaitingProps {
	onTimeEnd?: () => void;
	match: Pick<MatchDetails, 'type' | 'untilNext'> & { untilNext: string };
}

export const Waiting = ({ match, onTimeEnd }: WaitingProps) => {
	const { my, profileDetails } = useAuth();
	const router = useRouter();
	const { t } = useTranslation();

	const userName = profileDetails?.name ?? my?.name;
	const [currentTime, setCurrentTime] = useState(() => dayUtils.create());
	const trigger = useRef(false);
	const [timeSet, setTimeSet] = useState<TimeResult>(() => {
		return calculateTime(match.untilNext, currentTime);
	});

	const fire = () => {
		trigger.current = true;
		onTimeEnd?.();
	};

	const updateTime = useCallback(() => {
		if (trigger.current) return;

		const now = dayUtils.create();
		setCurrentTime(now);

		const { shouldTriggerCallback, value, delimeter } = calculateTime(match.untilNext, now);

		setTimeSet({
			shouldTriggerCallback,
			value,
			delimeter,
		});

		if (shouldTriggerCallback && onTimeEnd) {
			fire();
		}
	}, [match.untilNext, onTimeEnd]);

	useEffect(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [updateTime]);

	return (
		<View style={styles.container}>
			<Image
				source={require('@assets/images/idle-match/waiting-miho-character.webp')}
				style={styles.sandclockImage}
			/>
			<View style={styles.titleContainer}>
				<Text size="18" textColor="black" weight="semibold" style={styles.titleText}>
					{t('features.idle-match-timer.ui.waiting.title_1', {
						name: my?.name,
					})}
				</Text>
				<Text size="18" textColor="black" weight="semibold">
					{t('features.idle-match-timer.ui.waiting.title_2')}
				</Text>
			</View>

			<View style={styles.timeContainer}>
				<Time value={timeSet.delimeter} />
				<Time value="-" />
				{timeSet.value
					.toString()
					.split('')
					.map((value, key) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Time key={value + key} value={value} />
					))}
			</View>

			<View>
				<Text size="18" textColor="black" weight="semibold" style={styles.descriptionText1}>
					{t('features.idle-match-timer.ui.waiting.description_2')}
				</Text>
				<Text size="18" textColor="pale-purple" weight="normal" style={styles.descriptionText2}>
					{t('features.idle-match-timer.ui.waiting.description_3')}
				</Text>
			</View>

			<TouchableOpacity
				style={styles.sideButtonContainer}
				onPress={() => router.push('/matching-history')} // Assuming this route or preview route
				activeOpacity={0.8}
			>
				<View style={styles.topFillet} />
				<View style={styles.topFilletMask} />

				<Text style={styles.sideButtonText} textColor="white" size="12" weight="bold">
					내 프로필{'\n'}미리보기
				</Text>
				<IconWrapper width={24} height={24}>
					<ArrowRight />
				</IconWrapper>

				<View style={styles.bottomFillet} />
				<View style={styles.bottomFilletMask} />
			</TouchableOpacity>

			<Image source={require('@assets/images/idle-match/miho-fox.webp')} style={styles.foxImage} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 30,
		flex: 1,
		backgroundColor: semanticColors.surface.secondary,
		position: 'relative',
		overflow: 'hidden',
	},
	// ... (keep existing)
	sandclockImage: {
		width: 58,
		height: 68,
		resizeMode: 'contain',
	},
	titleContainer: {
		marginTop: 30,
		marginBottom: 8,
	},
	titleText: {
		marginBottom: 2,
	},
	timeContainer: {
		flexDirection: 'row',
		gap: 4,
		marginBottom: 8,
	},
	descriptionText1: {
		marginTop: 4,
	},
	descriptionText2: {
		marginTop: 8,
	},
	// ... (keep existing)

	// New Side Button Styles
	sideButtonContainer: {
		position: 'absolute',
		right: 0,
		top: '15%',
		backgroundColor: semanticColors.brand.primary,
		borderTopLeftRadius: 80,
		borderBottomLeftRadius: 80,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		width: 90,
		height: 156,
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: 4,
		paddingRight: 10,
		zIndex: 10,
		overflow: 'visible',
	},
	sideButtonText: {
		textAlign: 'center',
		marginBottom: 8,
		lineHeight: 18,
	},

	// Fillet Styles
	topFillet: {
		position: 'absolute',
		top: -30,
		right: 0,
		width: 30,
		height: 30,
		backgroundColor: semanticColors.brand.primary,
	},
	topFilletMask: {
		position: 'absolute',
		top: -30,
		right: 0,
		width: 30,
		height: 30,
		backgroundColor: semanticColors.surface.secondary,
		borderBottomRightRadius: 30,
	},
	bottomFillet: {
		position: 'absolute',
		bottom: -30,
		right: 0,
		width: 30,
		height: 30,
		backgroundColor: semanticColors.brand.primary,
	},
	bottomFilletMask: {
		position: 'absolute',
		bottom: -30,
		right: 0,
		width: 30,
		height: 30,
		backgroundColor: semanticColors.surface.secondary,
		borderTopRightRadius: 30,
	},

	foxImage: {
		position: 'absolute',
		bottom: -60,
		right: -40,
		width: Platform.select({ web: 200, default: 180 }),
		height: Platform.select({ web: 200, default: 180 }),
		resizeMode: 'contain',
		opacity: 0.5,
		transform: [{ rotate: '-10deg' }],
	},
});
