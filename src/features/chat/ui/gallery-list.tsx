import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Text as CustomText } from '@/src/shared/ui';
import { devLogWithTag } from '@/src/shared/utils';
import { convertToJpeg, uriToBase64 } from '@/src/shared/utils/image';
import { LegendList } from '@legendapp/list';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
	SlideOutDown,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../../auth';
import useChatRoomDetail from '../queries/use-chat-room-detail';
import { chatEventBus } from '../services/chat-event-bus';
import { generateTempId } from '../utils/generate-temp-id';
import ChatCamera from './camera';

interface GalleryListProps {
	isPhotoClicked: boolean;
}

export default function GalleryList({ isPhotoClicked }: GalleryListProps) {
	const { t } = useTranslation();
	const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([firstDummy]);
	const [endCursor, setEndCursor] = useState<string | null>(null);
	const { id } = useLocalSearchParams<{ id: string }>();
	const [hasNextPage, setHasNextPage] = useState(true);
	const [loading, setLoading] = useState(false);
	const { showModal, hideModal } = useModal();
	const heightAnim = useSharedValue(0);
	const [permissionGranted, setPermissionGranted] = useState(false);
	const { data: partner } = useChatRoomDetail(id);
	const { my: user } = useAuth();

	useEffect(() => {
		if (permissionGranted && photos.length === 0) {
			loadPhotos();
		}
	}, [permissionGranted]);

	useEffect(() => {
		requestPermission();
	}, []);

	useEffect(() => {
		if (isPhotoClicked) {
			heightAnim.value = withTiming(360, { duration: 300 });
		} else {
			heightAnim.value = withTiming(0, { duration: 1000 });
		}
	}, [isPhotoClicked]);

	const animatedStyle = useAnimatedStyle(() => {
		return { height: heightAnim.value };
	});

	const requestPermission = async () => {
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
			devLogWithTag('Gallery', 'Permission status:', status);
			if (status === 'granted') {
				setPermissionGranted(true);
			} else {
				Alert.alert(
					t('features.chat.ui.gallery.permission_required_title'),
					t('features.chat.ui.gallery.permission_required_message'),
					[{ text: t('features.chat.ui.gallery.confirm') }],
				);
			}
		} catch (error) {
			console.error('Permission request failed:', error);
		}
	};

	const loadPhotos = async () => {
		if (loading || !hasNextPage) {
			return;
		}

		setLoading(true);
		try {
			const result = await MediaLibrary.getAssetsAsync({
				mediaType: 'photo',
				first: 20,
				after: endCursor ?? undefined,
				sortBy: [MediaLibrary.SortBy.creationTime],
			});

			setPhotos((prevPhotos) => {
				const existingIds = new Set(prevPhotos.map((p) => p.id));

				const newPhotos = result.assets.filter((asset) => !existingIds.has(asset.id));

				return [...prevPhotos, ...newPhotos];
			});
			setEndCursor(result.endCursor);
			setHasNextPage(result.hasNextPage);
		} catch (error) {
			console.error('Failed to load photos:', error);
			Alert.alert(
				t('features.chat.ui.gallery.error_title'),
				t('features.chat.ui.gallery.error_load_photos'),
			);
		} finally {
			setLoading(false);
		}
	};

	const toggleSelect = async (uri: string) => {
		showModal({
			title: t('features.chat.ui.gallery.send_image_title'),
			children: (
				<CustomText textColor="black">
					{t('features.chat.ui.gallery.send_image_message')}
				</CustomText>
			),
			primaryButton: {
				text: t('features.chat.ui.gallery.send_button'),
				onClick: () => {
					sendImage(uri);
				},
			},
			secondaryButton: {
				text: t('features.chat.ui.gallery.cancel_button'),
				onClick: hideModal,
			},
		});
	};

	const sendImage = useCallback(
		async (uri: string) => {
			if (!partner?.partnerId || !user?.id) {
				return;
			}

			const jpegUri = await convertToJpeg(uri);
			const base64Image = await uriToBase64(jpegUri);

			chatEventBus.emit({
				type: 'IMAGE_UPLOAD_REQUESTED',
				payload: {
					to: partner.partnerId,
					chatRoomId: id,
					senderId: user.id,
					file: base64Image ?? jpegUri,
					tempId: generateTempId(),
				},
			});

			hideModal();
		},
		[partner, user, id, hideModal],
	);

	const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
		return (
			<Pressable onPress={() => toggleSelect(item.uri)} style={styles.imageBox}>
				<Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
			</Pressable>
		);
	};

	const handleEndReached = () => {
		loadPhotos();
	};

	if (!permissionGranted) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>{t('features.chat.ui.gallery.permission_denied')}</Text>
			</View>
		);
	}

	return (
		<Animated.View
			exiting={SlideOutDown.duration(300)}
			style={[
				{
					backgroundColor: semanticColors.surface.background,
					paddingTop: 12,
				},
				animatedStyle,
			]}
		>
			{photos.length > 0 && (
				<LegendList
					data={photos}
					numColumns={3}
					onEndReachedThreshold={0.3}
					onEndReached={handleEndReached}
					estimatedItemSize={120}
					keyExtractor={(item) => item.id}
					renderItem={({ item, index }) => (index === 0 ? <ChatCamera /> : renderItem({ item }))}
					recycleItems
				/>
			)}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	imageBox: {
		flex: 1,
		aspectRatio: 1,
		margin: 1,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.5)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	check: {
		color: semanticColors.text.inverse,
		fontSize: 24,
		fontWeight: 'bold',
	},
	permissionContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	permissionText: {
		fontSize: 16,
		textAlign: 'center',
		color: semanticColors.text.disabled,
	},
});

const firstDummy = {
	id: '하나_둘_셋_야!',
	filename: '천방지축_어리둥절_빙글빙글_',
	uri: '돌아가는_짱구의_하루',
	mediaType: MediaLibrary.MediaType.photo,
	mediaSubtypes: ['hdr' as MediaLibrary.MediaSubtype],
	width: 4032,
	height: 3024,
	creationTime: 1724644800000,
	modificationTime: 1724644860000,
	duration: 0,
	albumId: '우리의_짱구는_정말_못말려',
};
