import Layout from '@/src/features/layout';
import {
	MatchingMenu,
	MyActivityMenu,
	Notice,
	Profile,
	NotificationMenu,
	PrivacyMenu,
	SupportMenu,
} from '@/src/features/mypage/ui';
import { IdentityStatusCard } from '@/src/features/jp-identity';
import { isJapanese } from '@/src/shared/libs/local';
import { useSupportChatEnabled } from '@/src/features/support-chat/queries';
import {
	BottomNavigation,
	Button,
	Header,
	PalePurpleGradient,
	Text,
	HeaderWithNotification,
} from '@/src/shared/ui';
import { useUniversityCertificationPrompt } from '@/src/features/event/hooks/use-university-certification-prompt';
import SettingIcon from '@assets/icons/setting.svg';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// REMOVED: useProfileReviewRedirect - 자동 리다이렉션 제거 (2025-12-14)
// 사진 거절 상태는 이제 프로필 수정 → 사진관리 페이지에서 확인
// import { useProfileReviewRedirect } from "@/src/features/mypage/hooks/use-img-edit-status";

export default function MyScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { renderPromptModal } = useUniversityCertificationPrompt();
	const { data: supportChatEnabled } = useSupportChatEnabled();
	const queryClient = useQueryClient();

	useFocusEffect(
		useCallback(() => {
			queryClient.invalidateQueries({
				queryKey: ['my-profile-details'],
			});
			queryClient.invalidateQueries({
				queryKey: ['gem', 'current'],
			});
		}, [queryClient])
	);

	// REMOVED: 마이페이지 자동 리다이렉션 제거 (2025-12-14)
	// useProfileReviewRedirect();

	return (
		<Layout.Default
			style={{
				backgroundColor: '#fff',
			}}
		>
			<HeaderWithNotification
				centerContent={
					<Image
						source={require('@assets/images/MY_LOGO.png')}
						style={{ width: 40, height: 20 }}
						contentFit="contain"
					/>
				}
				showBackButton={false}
				rightContent={
					<TouchableOpacity>
						<View style={styles.iconContainer}>
							<Pressable onPress={() => router.navigate('/setting')}>
								<SettingIcon width={24} height={24} />
							</Pressable>
						</View>
					</TouchableOpacity>
				}
				style={{ marginTop: 9 }}
			/>

			<ScrollView style={styles.scrollViewContainer}>
				<View style={styles.profileContainer}>
					<Profile />
				</View>

				<View style={styles.menuContainer}>
					{supportChatEnabled?.enabled && <SupportMenu />}
					{isJapanese() && <IdentityStatusCard />}
					<MatchingMenu />
					<PrivacyMenu />
					<NotificationMenu />
					<MyActivityMenu />
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation />

			{renderPromptModal()}
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	iconContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	profileContainer: {
		paddingTop: 0,
		paddingBottom: 75,
	},
	iconPlace: {
		width: 40,
		height: 40,
	},
	scrollViewContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
	menuContainer: {
		paddingHorizontal: 10,
	},
});
