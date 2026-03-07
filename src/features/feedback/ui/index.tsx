import colors from '@/src/shared/constants/colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Portal } from '@/src/shared/providers/portal-provider';
import { Text } from '@shared/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FeedbackDrawer } from './feedback-drawer';

export const WallaFeedbackBanner = () => {
	const { t } = useTranslation();
	const { showModal, hideModal } = useModal();
	// drawerMounted: 마운트 여부 (애니메이션 완료 후 언마운트)
	// drawerVisible: Drawer에 전달하는 open/close 상태
	const [drawerMounted, setDrawerMounted] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const openDrawer = () => {
		if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
		setDrawerMounted(true);
		// 마운트 후 한 프레임 뒤 visible=true → 오픈 애니메이션 트리거
		requestAnimationFrame(() => setDrawerVisible(true));
	};

	const closeDrawer = () => {
		setDrawerVisible(false);
		// 닫기 애니메이션(300ms) 완료 후 언마운트
		unmountTimerRef.current = setTimeout(() => setDrawerMounted(false), 400);
	};

	const handleSuccess = () => {
		closeDrawer();
		showModal({
			title: t('features.feedback.ui.success.title'),
			children: null,
			primaryButton: {
				text: t('features.feedback.ui.success.confirm'),
				onClick: hideModal,
			},
		});
	};

	const handleError = () => {
		closeDrawer();
		showModal({
			title: t('features.feedback.ui.error.title'),
			children: null,
			primaryButton: {
				text: t('features.feedback.ui.error.confirm'),
				onClick: hideModal,
			},
		});
	};

	return (
		<>
			<TouchableOpacity
				style={styles.card}
				onPress={openDrawer}
				activeOpacity={0.75}
			>
				{/* 좌측: 이모지 아이콘 */}
				<View style={styles.iconBox}>
					<Text style={styles.iconText}>💌</Text>
				</View>

				{/* 텍스트 */}
				<View style={styles.textArea}>
					<Text size="13" weight="bold" textColor="black">
						{t('features.feedback.ui.banner.title')}
					</Text>
					<Text size="12" textColor="disabled" style={styles.subText}>
						{t('features.feedback.ui.banner.subtitle')}
					</Text>
				</View>

				{/* 화살표 */}
				<Text size="18" style={styles.arrow}>›</Text>
			</TouchableOpacity>

			{drawerMounted && (
				<Portal name="feedback-drawer">
					<FeedbackDrawer
						visible={drawerVisible}
						onClose={closeDrawer}
						onSuccess={handleSuccess}
						onError={handleError}
					/>
				</Portal>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		width: '100%',
		borderRadius: 16,
		borderWidth: 1.5,
		borderColor: '#E2D6FF',
		backgroundColor: colors.white,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 14,
		paddingHorizontal: 14,
	},
	iconBox: {
		width: 42,
		height: 42,
		borderRadius: 12,
		backgroundColor: '#F5F0FF',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	iconText: {
		fontSize: 22,
	},
	textArea: {
		flex: 1,
		gap: 2,
	},
	subText: {
		marginTop: 2,
	},
	arrow: {
		color: '#C4B5F4',
		flexShrink: 0,
	},
});
