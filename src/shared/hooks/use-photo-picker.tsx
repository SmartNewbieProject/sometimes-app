import React, { useCallback } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useModal } from './use-modal';
import { Text } from '../ui/text';
import { semanticColors } from '../constants/semantic-colors';
import colors from '../constants/colors';

interface PhotoPickerOptions {
	onTakePhoto: () => Promise<string | null>;
	onPickFromGallery: () => Promise<string | null>;
	showGuide?: boolean;
}

interface UsePhotoPickerReturn {
	showPhotoPicker: (options: PhotoPickerOptions) => void;
}

function PhotoPickerContent({
	onTakePhoto,
	onPickFromGallery,
	onClose,
	showGuide = true,
}: PhotoPickerOptions & { onClose: () => void }) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const handleTakePhoto = async () => {
		onClose();
		await onTakePhoto();
	};

	const handlePickFromGallery = async () => {
		onClose();
		await onPickFromGallery();
	};

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
			{showGuide && (
				<View style={styles.guideSection}>
					<Text size="sm" weight="light" textColor="inverse" style={styles.guideText}>
						{t('features.mypage.image-modal.tips_1')}
					</Text>
					<Text size="sm" weight="light" textColor="inverse" style={styles.guideText}>
						{t('features.mypage.image-modal.tips_2')}
					</Text>
					<Text size="sm" weight="light" textColor="inverse" style={styles.guideText}>
						{t('features.mypage.image-modal.tips_3')}
					</Text>
				</View>
			)}

			<View style={styles.optionsContainer}>
				<TouchableOpacity onPress={handleTakePhoto} style={styles.option}>
					<Text size="md" textColor="primary">
						{t('features.mypage.image-modal.take_photo')}
					</Text>
				</TouchableOpacity>
				<View style={styles.divider} />
				<TouchableOpacity onPress={handlePickFromGallery} style={styles.option}>
					<Text size="md" textColor="primary">
						{t('features.mypage.image-modal.choose_from_library')}
					</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity onPress={onClose} style={styles.closeButton}>
				<Text size="md" weight="bold" textColor="inverse">
					{t('features.mypage.image-modal.close')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

export function usePhotoPicker(): UsePhotoPickerReturn {
	const { showModal, hideModal } = useModal();

	const showPhotoPicker = useCallback(
		(options: PhotoPickerOptions) => {
			showModal({
				custom: () => (
					<PhotoPickerContent
						onTakePhoto={options.onTakePhoto}
						onPickFromGallery={options.onPickFromGallery}
						showGuide={options.showGuide}
						onClose={hideModal}
					/>
				),
				dismissable: true,
				position: 'bottom',
			});
		},
		[showModal, hideModal],
	);

	return { showPhotoPicker };
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingHorizontal: 20,
		...(Platform.OS === 'web' && {
			maxWidth: 468,
		}),
	},
	guideSection: {
		alignItems: 'center',
		marginBottom: 16,
	},
	guideText: {
		textAlign: 'center',
		lineHeight: 18,
	},
	optionsContainer: {
		backgroundColor: semanticColors.surface.background,
		borderRadius: 16,
		marginBottom: 12,
		overflow: 'hidden',
	},
	option: {
		paddingVertical: 16,
		alignItems: 'center',
	},
	divider: {
		height: 0.5,
		backgroundColor: '#F3EDFF',
	},
	closeButton: {
		backgroundColor: colors.primaryPurple,
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
	},
});
