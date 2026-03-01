/**
 * DEV 전용 Speed Dial FAB
 *
 * 우측 하단 원형 버튼 → 탭하면 위로 시나리오 칩들이 펼쳐짐
 * 칩 선택 → 즉시 mock UI 전환, "X" 칩 → 실제 API 복원
 *
 * __DEV__가 false면 null 렌더.
 */
import { queryClient } from '@/src/shared/config/query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SCENARIO_SHORT, type ScenarioId } from './scenarios';
import { useDevScenario } from './use-dev-scenario';

const SCENARIO_IDS: ScenarioId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ITEM_SIZE = 44;
const ITEM_GAP = 10;
const FAB_SIZE = 52;

interface DevScenarioFabProps {
	bottomOffset?: number;
}

export const DevScenarioFab = ({ bottomOffset }: DevScenarioFabProps) => {
	if (!__DEV__) return null;

	const [isOpen, setIsOpen] = useState(false);
	const anim = useRef(new Animated.Value(0)).current;
	const { activeScenario, setScenario } = useDevScenario();

	const toggle = () => {
		const willOpen = !isOpen;
		setIsOpen(willOpen);
		Animated.spring(anim, {
			toValue: willOpen ? 1 : 0,
			friction: 6,
			tension: 80,
			useNativeDriver: true,
		}).start();
	};

	const close = () => {
		setIsOpen(false);
		Animated.timing(anim, {
			toValue: 0,
			duration: 150,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	};

	const handleSelect = (id: ScenarioId | null) => {
		setScenario(id);
		close();
		queryClient.invalidateQueries({ queryKey: ['latest-matching-v31'] });
		queryClient.refetchQueries({ queryKey: ['latest-matching-v31'] });
	};

	// 리셋 칩 위치 (FAB 바로 위)
	const resetTranslateY = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -(ITEM_SIZE + ITEM_GAP)],
	});
	const resetScale = anim.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0, 0.5, 1],
	});

	// FAB 회전
	const fabRotate = anim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '45deg'],
	});

	return (
		<View style={[styles.container, bottomOffset != null && { bottom: bottomOffset }]} pointerEvents="box-none">
			{/* 배경 딤 — isOpen일 때만 터치 가능 */}
			{isOpen && (
				<Animated.View
					style={[
						styles.backdrop,
						{
							opacity: anim.interpolate({
								inputRange: [0, 1],
								outputRange: [0, 1],
							}),
						},
					]}
				>
					<Pressable style={StyleSheet.absoluteFill} onPress={close} />
				</Animated.View>
			)}

			{/* 시나리오 칩들 (아래에서 위로 펼쳐짐) */}
			{SCENARIO_IDS.map((id, index) => {
				const offset = (index + 3) * (ITEM_SIZE + ITEM_GAP);
				const translateY = anim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, -offset],
				});
				const scale = anim.interpolate({
					inputRange: [0, 0.4, 1],
					outputRange: [0, 0.3, 1],
				});
				const chipOpacity = anim.interpolate({
					inputRange: [0, 0.6, 1],
					outputRange: [0, 0, 1],
				});
				const info = SCENARIO_SHORT[id];
				const isActive = activeScenario === id;

				return (
					<Animated.View
						key={id}
						pointerEvents={isOpen ? 'auto' : 'none'}
						style={[
							styles.chipAnchor,
							{
								transform: [{ translateY }, { scale }],
								opacity: chipOpacity,
							},
						]}
					>
						<TouchableOpacity
							style={[
								styles.chip,
								{ backgroundColor: isActive ? info.color : '#FFFFFF', borderColor: info.color },
							]}
							onPress={() => handleSelect(id)}
							activeOpacity={0.7}
						>
							<Animated.Text style={[styles.chipNumber, isActive && styles.chipNumberActive]}>
								{id}
							</Animated.Text>
							<Animated.Text
								style={[styles.chipLabel, isActive && styles.chipLabelActive]}
								numberOfLines={1}
							>
								{info.label}
							</Animated.Text>
						</TouchableOpacity>
					</Animated.View>
				);
			})}

			{/* PV 칩 (리셋 바로 위) */}
			{(() => {
				const pvOffset = 2 * (ITEM_SIZE + ITEM_GAP);
				const pvTranslateY = anim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, -pvOffset],
				});
				const pvScale = anim.interpolate({
					inputRange: [0, 0.4, 1],
					outputRange: [0, 0.3, 1],
				});
				const pvOpacity = anim.interpolate({
					inputRange: [0, 0.6, 1],
					outputRange: [0, 0, 1],
				});
				return (
					<Animated.View
						pointerEvents={isOpen ? 'auto' : 'none'}
						style={[
							styles.chipAnchor,
							{
								transform: [{ translateY: pvTranslateY }, { scale: pvScale }],
								opacity: pvOpacity,
							},
						]}
					>
						<TouchableOpacity
							style={[styles.chip, { backgroundColor: '#FFFFFF', borderColor: '#8B5CF6' }]}
							onPress={() => {
								router.push('/viewed-me');
								close();
							}}
							activeOpacity={0.7}
						>
							<Animated.Text style={[styles.chipNumber, { color: '#8B5CF6' }]}>
								{'👁'}
							</Animated.Text>
							<Animated.Text style={styles.chipLabel} numberOfLines={1}>
								PV
							</Animated.Text>
						</TouchableOpacity>
					</Animated.View>
				);
			})()}

			{/* 리셋 칩 (FAB 바로 위) */}
			<Animated.View
				pointerEvents={isOpen ? 'auto' : 'none'}
				style={[
					styles.chipAnchor,
					{
						transform: [{ translateY: resetTranslateY }, { scale: resetScale }],
						opacity: anim,
					},
				]}
			>
				<TouchableOpacity
					style={[styles.chip, styles.resetChip, activeScenario === null && styles.resetChipActive]}
					onPress={() => handleSelect(null)}
					activeOpacity={0.7}
				>
					<Animated.Text
						style={[styles.chipNumber, activeScenario === null && styles.chipNumberActive]}
					>
						X
					</Animated.Text>
					<Animated.Text
						style={[styles.chipLabel, activeScenario === null && styles.chipLabelActive]}
					>
						리셋
					</Animated.Text>
				</TouchableOpacity>
			</Animated.View>

			{/* 메인 FAB */}
			<TouchableOpacity
				style={[
					styles.fab,
					activeScenario !== null && { backgroundColor: SCENARIO_SHORT[activeScenario].color },
				]}
				onPress={toggle}
				activeOpacity={0.85}
			>
				<Animated.Text style={[styles.fabText, { transform: [{ rotate: fabRotate }] }]}>
					{activeScenario !== null ? `#${activeScenario}` : '+'}
				</Animated.Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: 20,
		bottom: 100,
		alignItems: 'center',
		zIndex: 9999,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		top: -1000,
		left: -500,
		right: -500,
		bottom: -200,
		backgroundColor: 'rgba(0,0,0,0.25)',
	},
	fab: {
		width: FAB_SIZE,
		height: FAB_SIZE,
		borderRadius: FAB_SIZE / 2,
		backgroundColor: 'rgba(122, 74, 226, 0.85)',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 6,
	},
	fabText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '800',
	},
	chipAnchor: {
		position: 'absolute',
		bottom: 0,
		right: 0,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		height: ITEM_SIZE,
		paddingHorizontal: 12,
		borderRadius: ITEM_SIZE / 2,
		borderWidth: 1.5,
		gap: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 3,
		minWidth: ITEM_SIZE,
	},
	resetChip: {
		borderColor: '#9CA3AF',
		backgroundColor: '#FFFFFF',
	},
	resetChipActive: {
		backgroundColor: '#9CA3AF',
	},
	chipNumber: {
		fontSize: 14,
		fontWeight: '800',
		color: '#333333',
		width: 16,
		textAlign: 'center',
	},
	chipNumberActive: {
		color: '#FFFFFF',
	},
	chipLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: '#333333',
	},
	chipLabelActive: {
		color: '#FFFFFF',
	},
});
