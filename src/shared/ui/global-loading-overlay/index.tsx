import { useEffect, useMemo, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	Animated,
	Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { useGlobalLoadingStore } from '../../stores/global-loading-store';

const VIDEO_WIDTH = 300;
const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;
const WAVE_HEIGHT = 4;
const WAVE_DURATION = 400;
const WAVE_DELAY_PER_CHAR = 60;

interface AnimatedCharProps {
	char: string;
	index: number;
	fontFamily: string;
}

function AnimatedChar({ char, index, fontFamily }: AnimatedCharProps) {
	const translateY = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const delay = index * WAVE_DELAY_PER_CHAR;

		const animation = Animated.loop(
			Animated.sequence([
				Animated.delay(delay),
				Animated.timing(translateY, {
					toValue: -WAVE_HEIGHT,
					duration: WAVE_DURATION,
					useNativeDriver: Platform.OS !== 'web',
				}),
				Animated.timing(translateY, {
					toValue: 0,
					duration: WAVE_DURATION,
					useNativeDriver: Platform.OS !== 'web',
				}),
				Animated.delay(Math.max(0, 800 - delay)),
			]),
		);

		animation.start();

		return () => animation.stop();
	}, [index, translateY]);

	return (
		<Animated.Text
			style={[
				styles.char,
				{ fontFamily, transform: [{ translateY }] },
			]}
		>
			{char === ' ' ? '\u00A0' : char}
		</Animated.Text>
	);
}

interface WaveTextProps {
	text: string;
	fontFamily: string;
}

function WaveText({ text, fontFamily }: WaveTextProps) {
	const chars = text.split('');

	return (
		<View style={styles.waveContainer}>
			{chars.map((char, index) => (
				<AnimatedChar
					key={`${char}-${index}`}
					char={char}
					index={index}
					fontFamily={fontFamily}
				/>
			))}
		</View>
	);
}

function WebVideo({ isPlaying }: { isPlaying: boolean }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.play().catch(() => {});
			} else {
				videoRef.current.pause();
			}
		}
	}, [isPlaying]);

	return (
		<video
			ref={videoRef}
			src={require('../../../../assets/videos/miho-singing.mp4')}
			style={{
				width: VIDEO_WIDTH,
				height: VIDEO_HEIGHT,
				objectFit: 'contain',
				backgroundColor: 'transparent',
			}}
			loop
			muted
			playsInline
			autoPlay
		/>
	);
}

function NativeVideo({ isPlaying }: { isPlaying: boolean }) {
	return (
		<Video
			source={require('../../../../assets/videos/miho-singing.mp4')}
			style={styles.video}
			resizeMode={ResizeMode.CONTAIN}
			isLooping
			shouldPlay={isPlaying}
			isMuted
		/>
	);
}

export function GlobalLoadingOverlay() {
	const { isLoading } = useGlobalLoadingStore();
	const { t, i18n } = useTranslation();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const [isVisible, setIsVisible] = useState(false);

	const messages = useMemo(() => {
		return t('features.loading.global_overlay.messages', { returnObjects: true }) as string[];
	}, [t]);

	const [randomMessage, setRandomMessage] = useState('');

	useEffect(() => {
		if (Array.isArray(messages) && messages.length > 0) {
			const randomIndex = Math.floor(Math.random() * messages.length);
			setRandomMessage(messages[randomIndex]);
		}
	}, [messages, isLoading]);

	useEffect(() => {
		if (isLoading) {
			setIsVisible(true);
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: Platform.OS !== 'web',
			}).start();
		} else {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: Platform.OS !== 'web',
			}).start(() => {
				setIsVisible(false);
			});
		}
	}, [isLoading, fadeAnim]);

	const getFontFamily = () => {
		const currentLang = i18n.language;
		if (currentLang === 'ja') {
			return 'MPLUS1p-Bold';
		}
		return 'Pretendard-Bold';
	};

	if (!isVisible) {
		return null;
	}

	return (
		<Animated.View style={[styles.container, { opacity: fadeAnim }]} pointerEvents="auto">
			<View style={styles.content}>
				{Platform.OS === 'web' ? (
					<WebVideo isPlaying={isLoading} />
				) : (
					<NativeVideo isPlaying={isLoading} />
				)}
				<WaveText text={randomMessage} fontFamily={getFontFamily()} />
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 9999,
	},
	content: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	video: {
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		backgroundColor: 'transparent',
	},
	waveContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
		paddingHorizontal: 32,
	},
	char: {
		fontSize: 30,
		color: '#FFFFFF',
	},
});
