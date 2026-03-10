import { Text } from '@/src/shared/ui';
import PurpleRightArrow from '@assets/icons/purple-arrow.svg';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../auth';

const LOVE_CONCERNS_CODE = 'love-concerns';

export const CommunityAnnouncement = () => {
	const { profileDetails } = useAuth();
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() =>
				router.navigate(`/community?category=${LOVE_CONCERNS_CODE}`)
			}
		>
			<View style={styles.textContainer}>
				<Text textColor="black" weight="medium" style={styles.text}>
					{t('features.home.ui.community_announcement.greeting', {
						name: profileDetails?.name || t('features.home.ui.community_announcement.default_user'),
					})}
				</Text>
				<Text textColor="black" weight="medium" style={styles.text}>
					{t('features.home.ui.community_announcement.success_story_prompt')}
				</Text>
			</View>
			<View style={styles.arrowContainer}>
				<PurpleRightArrow />
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	textContainer: {
		marginVertical: 25,
	},
	text: {
		fontWeight: '700',
		fontSize: 18,
	},
	arrowContainer: {
		marginTop: 16,
	},
});
