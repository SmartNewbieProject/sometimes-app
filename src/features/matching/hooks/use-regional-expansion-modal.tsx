import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();

	const showExpansionModal = ({
		userRegion,
		expansionPath,
		onConfirm,
		onCancel,
	}: RegionalExpansionModalProps) => {
		const ExpansionContent = () => (
			<View style={styles.modalContent}>
				<Text style={styles.bodyText}>
					{t('features.matching.expandRegion.modal.description')}
				</Text>

				<View style={styles.pathContainer}>
					<Text style={styles.pathLabel}>
						{t('features.matching.expandRegion.modal.pathLabel')}
					</Text>
					<Text style={styles.pathText}>{expansionPath}</Text>
				</View>
			</View>
		);

		showModal({
			title: t('features.matching.expandRegion.modal.title'),
			children: <ExpansionContent />,
			buttonLayout: 'vertical',
			secondaryButton: {
				text: t('features.matching.expandRegion.modal.cta.cancel'),
				onClick: () => {
					hideModal();
					onCancel();
				},
			},
			primaryButton: {
				text: t('features.matching.expandRegion.modal.cta.confirm'),
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
