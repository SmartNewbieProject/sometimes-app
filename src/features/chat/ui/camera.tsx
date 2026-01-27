import { useModal } from '@/src/shared/hooks/use-modal';
import { eventBus } from '@/src/shared/libs/event-bus';
import { Text } from '@/src/shared/ui';
import { convertToJpeg, uriToBase64 } from '@/src/shared/utils/image';
import ChatCameraIcon from '@assets/icons/chat-camera.svg';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../../auth';
import useChatRoomDetail from '../queries/use-chat-room-detail';
import { chatEventBus } from '../services/chat-event-bus';
import { generateTempId } from '../utils/generate-temp-id';
function ChatCamera() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { showModal, hideModal } = useModal();
	const { data: partner } = useChatRoomDetail(id);
	const { my: user } = useAuth();
	const { t } = useTranslation();

	const takePhoto = async () => {
		let { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				t('features.chat.ui.camera.permission_required_title'),
				t('features.chat.ui.camera.permission_required_message'),
				[
					{
						text: t('features.chat.ui.camera.open_settings'),
						onPress: () => Linking.openSettings(),
					},
					{
						text: t('features.chat.ui.camera.close'),
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
			const jpegUri = await convertToJpeg(pickedUri);
			const imageUri = await uriToBase64(jpegUri);

			showModal({
				title: t('features.chat.ui.gallery.send_image_title'),
				children: <Text textColor="black">{t('features.chat.ui.gallery.send_image_message')}</Text>,
				primaryButton: {
					text: t('features.chat.ui.gallery.send_button'),
					onClick: async () => {
						if (!imageUri || !partner?.partnerId || !user?.id) {
							hideModal();
							return;
						}

						chatEventBus.emit({
							type: 'IMAGE_UPLOAD_REQUESTED',
							payload: {
								to: partner.partnerId,
								chatRoomId: id,
								senderId: user.id,
								file: imageUri,
								tempId: generateTempId(),
							},
						});
					},
				},
				secondaryButton: {
					text: t('features.chat.ui.gallery.cancel_button'),
					onClick: hideModal,
				},
			});
		}

		return null;
	};

	return (
		<Pressable onPress={takePhoto} style={styles.container}>
			<ChatCameraIcon />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		aspectRatio: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default ChatCamera;
