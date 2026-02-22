import { useUniversityCertificationPrompt } from '@/src/features/event/hooks/use-university-certification-prompt';
import { IdentityStatusCard } from '@/src/features/jp-identity';
import Layout from '@/src/features/layout';
import { BentoGrid } from '@/src/features/mypage/ui';
import { isJapanese } from '@/src/shared/libs/local';
import { BottomNavigation, HeaderWithNotification } from '@/src/shared/ui';
import SettingIcon from '@assets/icons/setting.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MyScreen() {
	const router = useRouter();
	const { renderPromptModal } = useUniversityCertificationPrompt();
	const queryClient = useQueryClient();

	useFocusEffect(
		useCallback(() => {
			queryClient.invalidateQueries({
				queryKey: ['my-profile-details'],
			});
			queryClient.invalidateQueries({
				queryKey: ['gem', 'current'],
			});
			queryClient.invalidateQueries({
				queryKey: ['mbti'],
			});
		}, [queryClient]),
	);

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
				<BentoGrid />
				{isJapanese() && <IdentityStatusCard />}
			</ScrollView>

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
	scrollViewContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
});
