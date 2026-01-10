import { useMyInfoReferrer } from '@/src/features/my-info/hooks';
import { useMixpanel } from '@/src/shared/hooks';
import { FloatingTooltip, Show } from '@/src/shared/ui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Home from '../..';
import HomeInfoCard from './home-info-card';
import HomeInfoGuideCard from './home-info-guide-card';

const { queries, hooks } = Home;
const { usePreferenceSelfQuery } = queries;
const { useRedirectPreferences } = hooks;

function HomeInfoSection() {
	const { isPreferenceFill } = useRedirectPreferences();
	const { trackEvent } = useMixpanel();
	const { data: preferencesSelf } = usePreferenceSelfQuery();
	const router = useRouter();
	const { t } = useTranslation();

	const handleClickButton = (to: 'my-info' | 'interest') => {
		if (to === 'my-info') {
			trackEvent('PROFILE_STARTED');
			useMyInfoReferrer.getState().setReferrer('home');
			router.navigate('/my-info');
		} else {
			trackEvent('INTEREST_STARTED', { type: 'home' });
			router.navigate('/interest');
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.cardRow}>
				<View style={styles.cardContainer}>
					<HomeInfoCard
						buttonMessage={
							preferencesSelf?.length !== 0
								? t('features.home.ui.home_info.home_info_section.status_complete')
								: t('features.home.ui.home_info.home_info_section.status_incomplete')
						}
						isCompleted={preferencesSelf?.length !== 0}
						onClick={() => handleClickButton('my-info')}
						characterImageUri={require('@assets/images/my-info-fox.webp')}
						heartImageUri={require('@assets/images/my-info-heart.webp')}
						title={t('features.home.ui.home_info.home_info_section.my_info_title')}
						description={t('features.home.ui.home_info.home_info_section.my_info_description')}
						characterPosition={{ left: -48, top: -15, width: 140, height: 102 }}
						heartPosition={{ top: 35, right: -5, width: 50, height: 50 }}
					/>
					<Show when={preferencesSelf?.length === 0}>
						<FloatingTooltip
							text={t('features.home.ui.home_info.home_info_section.my_info_tooltip')}
							rotation="bottom"
						/>
					</Show>
				</View>
				<View style={styles.cardContainer}>
					<HomeInfoCard
						buttonMessage={
							isPreferenceFill
								? t('features.home.ui.home_info.home_info_section.status_complete')
								: t('features.home.ui.home_info.home_info_section.status_incomplete')
						}
						isCompleted={isPreferenceFill}
						onClick={() => handleClickButton('interest')}
						characterImageUri={require('@assets/images/ideal-character.webp')}
						title={t('features.home.ui.home_info.home_info_section.preference_info_title')}
						description={t(
							'features.home.ui.home_info.home_info_section.preference_info_description',
						)}
						characterPosition={{ left: -20, top: -15, width: 120, height: 120 }}
					/>
					<Show when={!isPreferenceFill}>
						<FloatingTooltip
							text={t('features.home.ui.home_info.home_info_section.preference_info_tooltip')}
							rotation="bottom"
						/>
					</Show>
				</View>
			</View>
			<HomeInfoGuideCard />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		marginTop: 14,
	},
	cardRow: {
		flexDirection: 'row',
		gap: 14,
	},
	cardContainer: {
		position: 'relative',
		flex: 1,
	},
});

export default HomeInfoSection;
