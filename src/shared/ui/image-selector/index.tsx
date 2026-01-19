import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
	ActivityIndicator,
	Alert,
	Linking,
	Platform,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useModal } from '../../hooks/use-modal';
import { usePhotoPicker } from '../../hooks/use-photo-picker';
import { useDeviceResourceCheck } from '../../hooks/use-device-resource-check';
import { convertToJpeg, isHeicBase64 } from '../../utils/image';
import { compressImage } from '@/src/shared/libs/image-compression';
import { PROFILE_IMAGE_CONFIG } from '@/src/shared/libs/image-compression/config';
import { ContentSelector, type ContentSelectorSize } from '../content-selector';
import { ImageCropModal } from '../image-crop-modal';
import { Text } from '../text';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { devLogWithTag, devWarn } from '@/src/shared/utils';

export interface ImageSelectorProps {
	value?: string;
	onChange: (value: string) => void;
	size?: ContentSelectorSize;
	style?: StyleProp<ViewStyle>;
	actionLabel?: string;
	skipCompression?: boolean;
}

export interface ImageSelectorRef {
	openPicker: () => void;
}

export function renderImage(value: string | null, isPlaceHolder?: boolean) {
	if (!value) return null;
	return (
		<Image
			source={isPlaceHolder ? value : { uri: value }}
			style={{ width: '100%', height: '100%' }}
			contentFit="cover"
			cachePolicy="none"
		/>
	);
}

export function renderPlaceholder(t: (key: string) => string) {
	return (
		<View style={styles.placeholderWrapper}>
			<View style={styles.placeholderContent}>
				<Image
					source={require('@assets/images/image.png')}
					style={{ width: 70, height: 70 }}
					contentFit="cover"
				/>
				<Text size="sm" textColor="disabled">
					{t('shareds.image-selector.image_selector.add_photo')}
				</Text>
			</View>
		</View>
	);
}

export const ImageSelector = forwardRef<ImageSelectorRef, ImageSelectorProps>(
	({ value, onChange, size, style, actionLabel = undefined, skipCompression = false }, ref) => {
		const { t } = useTranslation();
		const [isCompressing, setIsCompressing] = useState(false);
		const [showCropModal, setShowCropModal] = useState(false);
		const [imageToCrop, setImageToCrop] = useState<string | null>(null);

		const { showErrorModal } = useModal();
		const { showPhotoPicker } = usePhotoPicker();
		const { checkBeforeImagePick } = useDeviceResourceCheck();

		const pickImage = async () => {
			const hasResources = await checkBeforeImagePick();
			if (!hasResources) {
				return null;
			}
			devLogWithTag('ImageSelector', 'pickImage started');
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			devLogWithTag('ImageSelector', 'Permission status:', status);

			if (status !== 'granted') {
				devLogWithTag('ImageSelector', 'Permission denied');
				Alert.alert('권한 필요', '사진을 가져오기 위해서는 권한이 필요합니다.', [
					{ text: t('common.설정_열기'), onPress: () => Linking.openSettings() },
					{
						text: t('common.닫기'),
					},
				]);
				return null;
			}

			devLogWithTag('ImageSelector', 'Launching image picker...');
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images', 'livePhotos'],
				allowsMultipleSelection: false,
				selectionLimit: 1,
			});
			devLogWithTag('ImageSelector', 'Image picker result:', {
				canceled: result.canceled,
				assetsCount: result.assets?.length,
			});

			if (!result.canceled) {
				const pickedUri = result.assets[0].uri;
				devLogWithTag('ImageSelector', 'Picked image URI length:', pickedUri.length);

				if (Platform.OS === 'web' && isHeicBase64(pickedUri)) {
					devLogWithTag('ImageSelector', 'HEIC format detected on web');
					showErrorModal('이미지 형식은 jpeg, jpg, png 형식만 가능해요', 'announcement');
					return null;
				}

				devLogWithTag('ImageSelector', 'Converting to JPEG...');
				const jpegUri = await convertToJpeg(pickedUri);
				devLogWithTag('ImageSelector', 'JPEG URI length:', jpegUri.length);

				devLogWithTag('ImageSelector', 'Opening crop modal...');
				setImageToCrop(jpegUri);
				setShowCropModal(true);
			} else {
				devLogWithTag('ImageSelector', 'Image selection canceled');
			}
			return null;
		};

		const takePhoto = async () => {
			const hasResources = await checkBeforeImagePick();
			if (!hasResources) {
				return null;
			}

			devLogWithTag('ImageSelector', 'takePhoto started');
			let { status } = await ImagePicker.requestCameraPermissionsAsync();
			devLogWithTag('ImageSelector', 'Camera permission status:', status);

			if (status !== 'granted') {
				devLogWithTag('ImageSelector', 'Camera permission denied');
				Alert.alert('권한 필요', '카메라 사용을 위해서 권한이 필요합니다', [
					{ text: t('common.설정_열기'), onPress: () => Linking.openSettings() },
					{
						text: t('common.닫기'),
					},
				]);
				return null;
			}

			devLogWithTag('ImageSelector', 'Launching camera...');
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ['images', 'livePhotos'],
				allowsMultipleSelection: false,
				selectionLimit: 1,
			});
			devLogWithTag('ImageSelector', 'Camera result:', {
				canceled: result.canceled,
				assetsCount: result.assets?.length,
			});

			status = (await MediaLibrary.requestPermissionsAsync()).status;
			if (status === 'granted' && result.assets?.[0].uri) {
				MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
			}

			if (!result.canceled) {
				const pickedUri = result.assets[0].uri;
				devLogWithTag('ImageSelector', 'Captured image URI length:', pickedUri.length);

				if (Platform.OS === 'web' && isHeicBase64(pickedUri)) {
					devLogWithTag('ImageSelector', 'HEIC format detected on web (camera)');
					showErrorModal('이미지 형식은 jpeg, jpg, png 형식만 가능해요', 'announcement');
					return null;
				}

				devLogWithTag('ImageSelector', 'Converting to JPEG (camera)...');
				const jpegUri = await convertToJpeg(pickedUri);
				devLogWithTag('ImageSelector', 'JPEG URI length (camera):', jpegUri.length);

				devLogWithTag('ImageSelector', 'Opening crop modal (camera)...');
				setImageToCrop(jpegUri);
				setShowCropModal(true);
			} else {
				devLogWithTag('ImageSelector', 'Camera capture canceled');
			}
			return null;
		};

		const handlePress = () => {
			if (isCompressing) return;
			showPhotoPicker({
				onTakePhoto: takePhoto,
				onPickFromGallery: pickImage,
				showGuide: true,
			});
		};

		const handleCropComplete = async (croppedUri: string) => {
			devLogWithTag('ImageSelector', 'Crop completed, URI length:', croppedUri.length);
			setShowCropModal(false);
			setImageToCrop(null);

			let finalUri = croppedUri;

			if (!skipCompression) {
				try {
					devLogWithTag('ImageSelector', 'Starting compression after crop...');
					setIsCompressing(true);

					const compressed = await compressImage(croppedUri, PROFILE_IMAGE_CONFIG);
					finalUri = compressed.uri;
					devLogWithTag('ImageSelector', 'Compression completed, URI length:', finalUri.length);
				} catch (error) {
					devWarn(t('common.이미지_압축_실패_원본_사용'), error);
				} finally {
					setIsCompressing(false);
				}
			}

			devLogWithTag('ImageSelector', 'Calling onChange with URI length:', finalUri.length);
			onChange(finalUri);
			devLogWithTag('ImageSelector', 'onChange called successfully');
		};

		const handleCropCancel = () => {
			devLogWithTag('ImageSelector', 'Crop canceled');
			setShowCropModal(false);
			setImageToCrop(null);
		};

		useImperativeHandle(ref, () => ({
			openPicker: handlePress,
		}));

		return (
			<View style={styles.container}>
				<Pressable onPress={handlePress} disabled={isCompressing}>
					<ContentSelector
						value={value}
						size={size}
						style={style}
						actionLabel={actionLabel}
						renderContent={renderImage}
						renderPlaceholder={() => renderPlaceholder(t)}
					/>
				</Pressable>
				{isCompressing && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color={semanticColors.brand.primary} />
						<Text size="sm" weight="medium" textColor="inverse" style={styles.loadingText}>
							{t('common.이미지를_최적화하고_있어요')}
						</Text>
					</View>
				)}
				{imageToCrop && (
					<ImageCropModal
						visible={showCropModal}
						imageUri={imageToCrop}
						onComplete={handleCropComplete}
						onCancel={handleCropCancel}
					/>
				)}
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		position: 'relative',
	},
	placeholderWrapper: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	placeholderContent: {
		width: '100%',
		height: '100%',
		backgroundColor: semanticColors.surface.secondary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
	},
	loadingText: {
		marginTop: 12,
		textAlign: 'center',
	},
});
