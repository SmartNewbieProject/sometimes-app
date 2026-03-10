import Layout from '@/src/features/layout';
import { BentoGrid } from '@/src/features/mypage/ui';
import { BottomNavigation, Header } from '@/src/shared/ui';
import SettingIcon from '@assets/icons/setting.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { InteractionManager, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MyScreen() {
	const router = useRouter();
	const queryClient = useQueryClient();

	useFocusEffect(
		useCallback(() => {
			const task = InteractionManager.runAfterInteractions(() => {
				queryClient.invalidateQueries({ queryKey: ['my-profile-details'], refetchType: 'active' });
				queryClient.invalidateQueries({ queryKey: ['gem', 'current'], refetchType: 'active' });
				queryClient.invalidateQueries({ queryKey: ['mbti'], refetchType: 'active' });
			});
			return () => task.cancel();
		}, [queryClient]),
	);

	return (
		<Layout.Default
			style={{
				backgroundColor: '#fff',
			}}
		>
			<Header.Container style={{ marginTop: 9 }}>
				<Image
					source={require('@assets/images/MY_LOGO.png')}
					style={{ width: 40, height: 20 }}
					contentFit="contain"
				/>
				<Header.RightContent>
					<TouchableOpacity>
						<View style={styles.iconContainer}>
							<Pressable onPress={() => router.navigate('/setting')}>
								<SettingIcon width={24} height={24} />
							</Pressable>
						</View>
					</TouchableOpacity>
				</Header.RightContent>
			</Header.Container>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
			>
				<BentoGrid />
			</ScrollView>

			<BottomNavigation />
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	iconContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
});
