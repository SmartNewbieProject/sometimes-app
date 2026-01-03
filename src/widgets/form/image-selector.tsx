import { useModal } from '@/src/shared/hooks/use-modal';
import { usePhotoPicker } from '@/src/shared/hooks/use-photo-picker';
import { ContentSelector } from '@/src/shared/ui/content-selector';
import { renderImage, renderPlaceholder } from '@/src/shared/ui/image-selector';
import { convertToJpeg, isHeicBase64 } from '@/src/shared/utils/image';
import type { StyleProp, ViewStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { type UseControllerProps, useController } from 'react-hook-form';
import { Alert, Linking, Platform, Pressable } from 'react-native';
import i18n from '@/src/shared/libs/i18n';

interface FormImageSelectorProps extends UseControllerProps {
	style?: StyleProp<ViewStyle>;
	size?: 'sm' | 'md' | 'lg';
	actionLabel?: string;
}

export function FormImageSelector({
	name,
	control,
	rules,
	style,
	size,
	actionLabel,
}: FormImageSelectorProps) {
	const {
		field: { value, onChange },
	} = useController({
		name,
		control,
		rules,
	});
	const { showErrorModal } = useModal();
	const { showPhotoPicker } = usePhotoPicker();

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				i18n.t('widgets.form.image_selector.permission_needed_title'),
				i18n.t('widgets.form.image_selector.gallery_permission_message'),
				[
					{
						text: i18n.t('widgets.form.image_selector.open_settings_button'),
						onPress: () => Linking.openSettings(),
					},
					{
						text: i18n.t('widgets.form.image_selector.close_button'),
					},
				],
			);
			return null;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: false,
			selectionLimit: 1,
		});

		if (!result.canceled) {
			const pickedUri = result.assets[0].uri;
			if (Platform.OS === 'web' && isHeicBase64(pickedUri)) {
				showErrorModal(i18n.t('widgets.form.image_selector.invalid_image_format'), 'announcement');
				return null;
			}
			const jpegUri = await convertToJpeg(pickedUri);
			onChange(jpegUri);
		}
		return null;
	};

	const takePhoto = async () => {
		let { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				i18n.t('widgets.form.image_selector.permission_needed_title'),
				i18n.t('widgets.form.image_selector.camera_permission_message'),
				[
					{
						text: i18n.t('widgets.form.image_selector.open_settings_button'),
						onPress: () => Linking.openSettings(),
					},
					{
						text: i18n.t('widgets.form.image_selector.close_button'),
					},
				],
			);
			return null;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: false,
			selectionLimit: 1,
		});
		status = (await MediaLibrary.requestPermissionsAsync()).status;
		if (status === 'granted' && result.assets?.[0].uri) {
			MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
		}

		if (!result.canceled) {
			const pickedUri = result.assets[0].uri;
			if (Platform.OS === 'web' && isHeicBase64(pickedUri)) {
				showErrorModal(i18n.t('widgets.form.image_selector.invalid_image_format'), 'announcement');
				return null;
			}
			const jpegUri = await convertToJpeg(pickedUri);
			onChange(jpegUri);
		}
		return null;
	};

	const handlePress = () => {
		showPhotoPicker({
			onTakePhoto: takePhoto,
			onPickFromGallery: pickImage,
			showGuide: false,
		});
	};

	return (
		<Pressable onPress={handlePress}>
			<ContentSelector
				value={value}
				size={size}
				style={style}
				actionLabel={actionLabel}
				renderContent={renderImage}
				renderPlaceholder={() => renderPlaceholder(i18n.t)}
			/>
		</Pressable>
	);
}
