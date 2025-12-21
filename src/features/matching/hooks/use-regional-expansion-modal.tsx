import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useModal } from '@/src/shared/hooks/use-modal';
import colors from '@/src/shared/constants/colors';

interface RegionalExpansionModalProps {
	userRegion: string;
	expansionPath: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export const useRegionalExpansionModal = () => {
	const { showModal, hideModal } = useModal();

	const showExpansionModal = ({
		userRegion,
		expansionPath,
		onConfirm,
		onCancel,
	}: RegionalExpansionModalProps) => {
		const ExpansionContent = () => (
			<View style={styles.modalContent}>
				<Text style={styles.bodyText}>
					회원님 지역에선 아직 새 인연이 준비 중이에요.{'\n\n'}
					하지만 조금만 기다려주세요!{'\n'}
					인근 지역에는 회원님을 기다리는 설레는 인연이 있을 거예요.
				</Text>

				<View style={styles.pathContainer}>
					<Text style={styles.pathLabel}>✨ 가까운 곳부터 차근차근</Text>
					<Text style={styles.pathText}>{expansionPath}</Text>
				</View>
			</View>
		);

		showModal({
			title: '조금만 더 범위를\n넓혀볼까요?',
			children: <ExpansionContent />,
			buttonLayout: 'vertical',
			secondaryButton: {
				text: '다음에 할게요',
				onClick: () => {
					hideModal();
					onCancel();
				},
			},
			primaryButton: {
				text: '내 인연 더 찾아보기',
				onClick: () => {
					hideModal();
					onConfirm();
				},
			},
		});
	};

	return { showExpansionModal };
};

const styles = StyleSheet.create({
	modalContent: {
		paddingVertical: 8,
		gap: 12,
	},
	bodyText: {
		fontSize: 15,
		lineHeight: 22,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 8,
	},
	pathContainer: {
		backgroundColor: colors.surface.surface,
		padding: 16,
		borderRadius: 12,
		marginTop: 8,
	},
	pathLabel: {
		fontSize: 13,
		color: colors.text.muted,
		marginBottom: 6,
	},
	pathText: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.brand.primary,
	},
});
