import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	runOnJS,
} from 'react-native-reanimated';

interface AnimatedTransitionProps {
	transitionKey: string | number;
	direction?: 'forward' | 'backward';
	children: React.ReactNode;
}

const SLIDE_DISTANCE = 30;
const DURATION = 250;
const EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

export const AnimatedTransition = ({
	transitionKey,
	direction = 'forward',
	children,
}: AnimatedTransitionProps) => {
	const translateX = useSharedValue(0);
	const opacity = useSharedValue(1);
	const [displayChildren, setDisplayChildren] = useState(children);
	const isFirstRender = useRef(true);
	const prevKey = useRef(transitionKey);
	const childrenRef = useRef(children);
	const isTransitioning = useRef(false);

	useEffect(() => {
		childrenRef.current = children;
	}, [children]);

	const onTransitionComplete = useCallback((key: string | number) => {
		setDisplayChildren(childrenRef.current);
		prevKey.current = key;
		isTransitioning.current = false;
	}, []);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (prevKey.current === transitionKey) return;

		isTransitioning.current = true;
		const isForward = direction === 'forward';
		const nextKey = transitionKey;

		// 1. 현재 콘텐츠를 퇴장
		opacity.value = withTiming(0, { duration: DURATION / 2, easing: EASING });
		translateX.value = withTiming(
			isForward ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
			{ duration: DURATION / 2, easing: EASING },
			() => {
				// 2. 새 콘텐츠 위치로 이동 (화면 밖)
				translateX.value = isForward ? SLIDE_DISTANCE : -SLIDE_DISTANCE;
				runOnJS(onTransitionComplete)(nextKey);

				// 3. 새 콘텐츠 진입
				translateX.value = withTiming(0, { duration: DURATION / 2, easing: EASING });
				opacity.value = withTiming(1, { duration: DURATION / 2, easing: EASING });
			},
		);
	}, [transitionKey, direction, translateX, opacity, onTransitionComplete]);

	// 키가 같을 때는 children 동기화 (transition 중에는 무시)
	useEffect(() => {
		if (!isTransitioning.current && prevKey.current === transitionKey) {
			setDisplayChildren(children);
		}
	}, [children, transitionKey]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
		opacity: opacity.value,
	}));

	return <Animated.View style={[styles.container, animatedStyle]}>{displayChildren}</Animated.View>;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
