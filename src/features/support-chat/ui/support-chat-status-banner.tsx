import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import type { SessionStatus } from '../types';

interface SupportChatStatusBannerProps {
	status: SessionStatus;
}

type StepState = 'done' | 'active' | 'pending';

interface StepConfig {
	labelKey: string;
	state: StepState;
}

const STEP_KEYS = [
	'status.steps.received',
	'status.steps.ai_analysis',
	'status.steps.agent',
	'status.steps.resolved',
] as const;

function getSteps(status: SessionStatus): StepState[] {
	switch (status) {
		case 'bot_handling':
			return ['done', 'active', 'pending', 'pending'];
		case 'waiting_admin':
		case 'admin_handling':
			return ['done', 'done', 'active', 'pending'];
		case 'admin_resolved':
		case 'user_closed':
		case 'resolved':
			return ['done', 'done', 'done', 'done'];
		default:
			return ['pending', 'pending', 'pending', 'pending'];
	}
}

function PulseDot({ stepNumber }: { stepNumber: number }) {
	const opacity = useSharedValue(1);

	useEffect(() => {
		opacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<Animated.View style={[styles.dot, styles.dotActive, animatedStyle]}>
			<Text style={styles.dotNumber}>{stepNumber}</Text>
		</Animated.View>
	);
}

function StepDot({ state, stepNumber }: { state: StepState; stepNumber: number }) {
	if (state === 'done') {
		return (
			<View style={[styles.dot, styles.dotDone]}>
				<Text style={styles.dotCheck}>{'✓'}</Text>
			</View>
		);
	}

	if (state === 'active') {
		return <PulseDot stepNumber={stepNumber} />;
	}

	return (
		<View style={[styles.dot, styles.dotPending]}>
			<Text style={styles.dotNumberPending}>{stepNumber}</Text>
		</View>
	);
}

function StepLine({ done }: { done: boolean }) {
	return <View style={[styles.line, done ? styles.lineDone : styles.linePending]} />;
}

function SupportChatStatusBanner({ status }: SupportChatStatusBannerProps) {
	const { t } = useTranslation();
	const stepStates = getSteps(status);

	const steps: StepConfig[] = STEP_KEYS.map((key, i) => ({
		labelKey: key,
		state: stepStates[i],
	}));

	return (
		<View style={styles.container}>
			<View style={styles.stepsRow}>
				{steps.map((step, i) => (
					<React.Fragment key={STEP_KEYS[i]}>
						<View style={styles.stepItem}>
							<StepDot state={step.state} stepNumber={i + 1} />
							<Text
								style={[
									styles.stepLabel,
									step.state === 'done' && styles.stepLabelDone,
									step.state === 'active' && styles.stepLabelActive,
									step.state === 'pending' && styles.stepLabelPending,
								]}
								numberOfLines={1}
							>
								{t(`features.support-chat.${step.labelKey}`)}
							</Text>
						</View>
						{i < steps.length - 1 && <StepLine done={stepStates[i] === 'done'} />}
					</React.Fragment>
				))}
			</View>
		</View>
	);
}

const DOT_SIZE = 22;

const styles = StyleSheet.create({
	container: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: colors.surface.background,
	},
	stepsRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	stepItem: {
		alignItems: 'center',
		width: 52,
	},
	dot: {
		width: DOT_SIZE,
		height: DOT_SIZE,
		borderRadius: DOT_SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	dotDone: {
		backgroundColor: '#4CAF50',
	},
	dotActive: {
		backgroundColor: colors.brand.primary,
	},
	dotPending: {
		backgroundColor: '#E5E8EB',
	},
	dotCheck: {
		fontSize: 12,
		color: '#FFFFFF',
		fontWeight: '700',
	},
	dotNumber: {
		fontSize: 11,
		color: '#FFFFFF',
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
	},
	dotNumberPending: {
		fontSize: 11,
		color: '#9CA3AF',
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
	},
	line: {
		flex: 1,
		height: 2,
		marginTop: DOT_SIZE / 2 - 1,
	},
	lineDone: {
		backgroundColor: '#4CAF50',
	},
	linePending: {
		backgroundColor: '#E5E8EB',
	},
	stepLabel: {
		fontSize: 10,
		marginTop: 4,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		textAlign: 'center',
	},
	stepLabelDone: {
		color: '#4CAF50',
	},
	stepLabelActive: {
		color: colors.brand.primary,
	},
	stepLabelPending: {
		color: '#9CA3AF',
	},
});

export default SupportChatStatusBanner;
