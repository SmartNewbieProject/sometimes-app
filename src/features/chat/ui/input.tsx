import { JP_LEGAL_LINKS } from '@/src/shared/constants/jp-legal-links';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import BulbIcon from '@assets/icons/bulb.svg';
import SendChatIcon from '@assets/icons/send-chat.svg';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Keyboard,
	Linking,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from 'react-native';
import Animated, {
	useAnimatedKeyboard,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth';
import { useJpAgeConfirmation } from '../hooks/use-jp-age-confirmation';
import useChatRoomDetail from '../queries/use-chat-room-detail';
import useChatTips from '../queries/use-chat-tips';
import { chatEventBus } from '../services/chat-event-bus';
import { generateTempId } from '../utils/generate-temp-id';
import ChatTipsModal from './chat-tips-modal';

interface ChatInputProps {
	isPhotoClicked: boolean;
	setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChatInput({ isPhotoClicked, setPhotoClicked }: ChatInputProps) {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: partner } = useChatRoomDetail(id);
	const { my: user } = useAuth();
	const { showModal } = useModal();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const { needsAgeConfirmation, confirmAge, isJP } = useJpAgeConfirmation();

	const { width } = useWindowDimensions();
	const [chat, setChat] = useState('');
	const [isTipsModalVisible, setTipsModalVisible] = useState(false);
	const { mutate: fetchTips, data: tipsData, isPending: isTipsLoading } = useChatTips();
	const rotate = useSharedValue(0);

	const handlePhotoButton = () => {
		setTimeout(() => {
			setPhotoClicked((prev) => !prev);
		}, 400);
		Keyboard.dismiss();
	};

	const handleTipsButton = () => {
		if (partner?.hasLeft) return;

		showModal({
			showLogo: true,
			customTitle: (
				<View style={styles.modalTitleContainer}>
					<Text style={styles.modalTitleText}>
						{t('features.chat.ui.tips_modal.confirm_title_1')}
					</Text>
					<Text style={styles.modalTitleText}>
						{t('features.chat.ui.tips_modal.confirm_title_2')}
					</Text>
				</View>
			),
			children: (
				<View style={styles.modalBodyContainer}>
					<Text style={styles.modalBodyText}>
						{t('features.chat.ui.tips_modal.confirm_desc_1')}
					</Text>
					<Text style={styles.modalBodyText}>
						{t('features.chat.ui.tips_modal.confirm_desc_2')}
					</Text>
				</View>
			),
			primaryButton: {
				text: t('features.chat.ui.tips_modal.confirm_button'),
				onClick: () => {
					setTipsModalVisible(true);
					fetchTips(id);
				},
			},
			secondaryButton: {
				text: t('features.chat.ui.tips_modal.cancel_button'),
				onClick: () => {},
			},
		});
	};

	const handleSelectTip = (question: string) => {
		setChat(question);
	};

	useEffect(() => {
		if (isPhotoClicked) {
			rotate.value = withTiming(45, {
				duration: 150,
			});
		} else {
			rotate.value = withTiming(0, {
				duration: 150,
			});
		}
	}, [isPhotoClicked]);

	const animatedStyles = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotate.value}deg` }],
	}));
	const keyboard = useAnimatedKeyboard();

	const animatedKeyboardStyles = useAnimatedStyle(() => ({
		paddingBottom: Platform.OS === 'android' && keyboard.height.value > 0 ? 16 : 0,
	}));

	const sendMessage = useCallback(() => {
		if (chat === '' || !partner?.partnerId || !user?.id) {
			return;
		}

		const messageContent = chat.trim();
		setChat('');

		chatEventBus.emit({
			type: 'MESSAGE_SEND_REQUESTED',
			payload: {
				to: partner.partnerId,
				chatRoomId: id,
				senderId: user.id,
				content: messageContent,
				tempId: generateTempId(),
			},
		});
	}, [chat, partner, user, id]);

	const showJpAgeConfirmationModal = useCallback(() => {
		showModal({
			title: t('jp_legal.age_confirmation_modal.title'),
			children: (
				<View style={styles.ageModalContainer}>
					<Text style={styles.ageModalText}>
						{t('jp_legal.age_confirmation_modal.description')}
					</Text>
					<Pressable
						onPress={() => Linking.openURL(JP_LEGAL_LINKS.ageConfirmation)}
						style={styles.ageModalLinkContainer}
					>
						<Text style={styles.ageModalLink}>
							{t('jp_legal.age_confirmation_modal.link_text')}
						</Text>
					</Pressable>
				</View>
			),
			primaryButton: {
				text: t('jp_legal.age_confirmation_modal.confirm_button'),
				onClick: async () => {
					const confirmed = await confirmAge();
					if (confirmed) {
						sendMessage();
					}
				},
			},
			secondaryButton: {
				text: t('jp_legal.age_confirmation_modal.cancel_button'),
				onClick: () => {},
			},
		});
	}, [t, confirmAge, sendMessage, showModal]);

	const handleSend = useCallback(async () => {
		if (chat === '' || !partner?.partnerId || !user?.id) {
			return;
		}

		if (needsAgeConfirmation) {
			showJpAgeConfirmationModal();
			return;
		}

		sendMessage();
	}, [chat, partner, user, needsAgeConfirmation, showJpAgeConfirmationModal, sendMessage]);

	return (
		<>
			<Animated.View
				style={[
					styles.container,
					{ width: width, paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12 },
					animatedKeyboardStyles,
				]}
			>
				<Pressable onPress={handlePhotoButton} style={styles.photoButton}>
					<Animated.View style={animatedStyles}>
						<Image source={require('@assets/icons/plus.png')} style={{ width: 14, height: 14 }} />
					</Animated.View>
				</Pressable>
				<Pressable onPress={handleTipsButton} style={styles.tipsButton} disabled={partner?.hasLeft}>
					<BulbIcon width={24} height={24} />
				</Pressable>
				<View style={styles.inputContainer}>
					<TextInput
						multiline={true}
						value={chat}
						editable={!isPhotoClicked && !partner?.hasLeft}
						onChangeText={(text) => setChat(text)}
						style={styles.textInput}
						placeholder={
							partner?.hasLeft
								? t('features.chat.ui.input.placeholder_ended')
								: t('features.chat.ui.input.placeholder')
						}
						placeholderTextColor={semanticColors.text.disabled}
						numberOfLines={3}
					/>
					{chat !== '' && (
						<Pressable onPress={handleSend} style={styles.send}>
							<SendChatIcon width={32} height={32} />
						</Pressable>
					)}
				</View>
			</Animated.View>

			<ChatTipsModal
				visible={isTipsModalVisible}
				onClose={() => setTipsModalVisible(false)}
				tips={tipsData?.tips ?? []}
				isLoading={isTipsLoading}
				onSelectTip={handleSelectTip}
				onRefresh={() => fetchTips(id)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	textInput: {
		flex: 1,
		alignSelf: 'center',
		fontSize: 16,
		lineHeight: 18,
		marginVertical: 14,
		letterSpacing: -0.042,
		paddingHorizontal: 10,
		...(Platform.OS === 'android' ? { textAlignVertical: 'center' } : { paddingVertical: 0 }),
		color: semanticColors.text.secondary,
	},
	inputContainer: {
		flex: 1,
		minHeight: 47,
		marginLeft: 12,
		marginRight: 4,
		position: 'relative',
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 24,
		backgroundColor: semanticColors.surface.surface,
		paddingHorizontal: 8,
		marginBottom: 20,
	},
	container: {
		minHeight: 70,
		alignItems: 'center',
		backgroundColor: semanticColors.surface.background,
		flexDirection: 'row',
		paddingVertical: 12,

		paddingHorizontal: 16,
	},
	photoButton: {
		width: 32,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 16,
		backgroundColor: semanticColors.surface.background,
		marginBottom: 20,
	},
	send: {
		width: 32,
		marginVertical: 8,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 9999,
		alignSelf: 'flex-end',
		textAlignVertical: 'top',
		backgroundColor: semanticColors.brand.primary,
	},
	tipsButton: {
		width: 40,
		height: 40,
		marginLeft: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		backgroundColor: '#FFF9E6',
		marginBottom: 20,
	},
	modalText: {
		fontSize: 15,
		lineHeight: 22,
		color: semanticColors.text.secondary,
		textAlign: 'center',
		fontFamily: 'Pretendard-Regular',
	},
	modalTitleContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		width: '100%',
	},
	modalTitleText: {
		color: semanticColors.text.primary,
		fontWeight: '700',
		fontSize: 20,
		fontFamily: 'Pretendard-Bold',
	},
	modalBodyContainer: {
		flexDirection: 'column',
		width: '100%',
		alignItems: 'center',
		marginTop: 5,
	},
	modalBodyText: {
		color: semanticColors.text.disabled,
		fontSize: 12,
		fontFamily: 'Pretendard-Regular',
	},
	ageModalContainer: {
		alignItems: 'center',
		paddingHorizontal: 16,
	},
	ageModalText: {
		fontSize: 14,
		lineHeight: 22,
		color: semanticColors.text.secondary,
		textAlign: 'center',
		fontFamily: 'Pretendard-Regular',
	},
	ageModalLinkContainer: {
		marginTop: 16,
	},
	ageModalLink: {
		fontSize: 13,
		color: semanticColors.brand.primary,
		textDecorationLine: 'underline',
		fontFamily: 'Pretendard-Medium',
	},
});

export default ChatInput;
