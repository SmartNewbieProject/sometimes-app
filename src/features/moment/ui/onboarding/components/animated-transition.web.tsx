import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface AnimatedTransitionProps {
	transitionKey: string | number;
	direction?: 'forward' | 'backward';
	children: React.ReactNode;
}

const SLIDE_DISTANCE = 30;
const DURATION = 250;
const TRANSITION_CSS = `transform ${DURATION / 2}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity ${DURATION / 2}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;

export const AnimatedTransition = ({
	transitionKey,
	direction = 'forward',
	children,
}: AnimatedTransitionProps) => {
	const [displayChildren, setDisplayChildren] = useState(children);
	const [phase, setPhase] = useState<'visible' | 'exiting' | 'entering'>('visible');
	const isFirstRender = useRef(true);
	const prevKey = useRef(transitionKey);
	const childrenRef = useRef(children);
	const isTransitioning = useRef(false);

	// 항상 최신 children을 ref에 보관
	useEffect(() => {
		childrenRef.current = children;
	}, [children]);

	// transitionKey 변경 시 exit 애니메이션 시작
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (prevKey.current === transitionKey) return;

		isTransitioning.current = true;
		setPhase('exiting');
	}, [transitionKey]);

	// exit 완료 후 → entering → visible 순서로 전환
	useEffect(() => {
		if (phase === 'exiting') {
			const timer = setTimeout(() => {
				setDisplayChildren(childrenRef.current);
				prevKey.current = transitionKey;
				setPhase('entering');
			}, DURATION / 2);
			return () => clearTimeout(timer);
		}

		if (phase === 'entering') {
			// 브라우저가 entering 위치를 페인트한 후 visible로 전환
			const raf = requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setPhase('visible');
					isTransitioning.current = false;
				});
			});
			return () => cancelAnimationFrame(raf);
		}
	}, [phase, transitionKey]);

	// 키가 같을 때는 children 동기화 (transition 중에는 무시)
	useEffect(() => {
		if (!isTransitioning.current && prevKey.current === transitionKey) {
			setDisplayChildren(children);
		}
	}, [children, transitionKey]);

	const isForward = direction === 'forward';

	const getTransformStyle = () => {
		if (phase === 'exiting') {
			return {
				opacity: 0,
				transform: [{ translateX: isForward ? -SLIDE_DISTANCE : SLIDE_DISTANCE }],
			};
		}
		if (phase === 'entering') {
			return {
				opacity: 0,
				transform: [{ translateX: isForward ? SLIDE_DISTANCE : -SLIDE_DISTANCE }],
			};
		}
		return {
			opacity: 1,
			transform: [{ translateX: 0 }],
		};
	};

	return (
		<View
			style={[
				styles.container,
				getTransformStyle(),
				phase !== 'entering' && {
					// @ts-ignore - web-only CSS transition property
					transition: TRANSITION_CSS,
				},
			]}
		>
			{displayChildren}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
