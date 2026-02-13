import { IdealTypeTestNavTitle } from '@/src/features/ideal-type-test/ui/moment-nav-card-title';
import colors from '@/src/shared/constants/colors';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import type { MomentNavigationItem } from '../types';

const titleStyle = {
	fontSize: 14,
	fontWeight: '600' as const,
	color: colors.black,
	lineHeight: 22,
};

const EventsTitle = () => {
	const { t } = useTranslation();
	return <Text style={titleStyle}>{t('features.moment.navigation.events_title')}</Text>;
};

const MyMomentTitle = () => {
	const { t } = useTranslation();
	return <Text style={titleStyle}>{t('features.moment.navigation.my_moment_title')}</Text>;
};

const CheckInTitle = () => {
	const { t } = useTranslation();
	return <Text style={titleStyle}>{t('features.moment.navigation.check_in_title')}</Text>;
};

const RouletteTitle = () => {
	const { t } = useTranslation();
	return <Text style={titleStyle}>{t('features.moment.navigation.roulette_title')}</Text>;
};

const SomemateTitle = () => {
	const { t } = useTranslation();
	return <Text style={titleStyle}>{t('features.moment.navigation.somemate_title')}</Text>;
};

const WeeklyReportTitle = () => {
	const { t } = useTranslation();
	return <Text style={titleStyle}>{t('features.moment.navigation.weekly_report_title')}</Text>;
};

export const MOMENT_NAVIGATION_ITEMS: MomentNavigationItem[] = [
	{
		id: 'moment-events',
		titleComponent: <EventsTitle />,
		descriptionKey: 'features.moment.navigation.events_description',
		backgroundImageUrl: require('@/assets/images/moment/menu/events.webp'),
		imageSize: 100,
		isReady: false,
		disabledMessageKey: 'features.moment.navigation.events_disabled_message',
		onPress: () => {
			console.log('진행중인 이벤트로 이동');
		},
	},
	{
		id: 'moment-my-moment',
		titleComponent: <MyMomentTitle />,
		descriptionKey: 'features.moment.navigation.my_moment_description',
		backgroundImageUrl: require('@/assets/images/moment/menu/moment.webp'),
		imageSize: 100,
		disabledTextKey: 'features.moment.navigation.my_moment_disabled_text',
		disabledMessageKey: 'features.moment.navigation.my_moment_disabled_message',
		onPress: () => {
			router.push('/moment/my-moment');
		},
	},
	{
		id: 'moment-check-in',
		titleComponent: <CheckInTitle />,
		descriptionKey: 'features.moment.navigation.check_in_description',
		backgroundImageUrl: require('@/assets/images/moment/menu/check.webp'),
		isReady: false,
		disabledMessageKey: 'features.moment.navigation.check_in_disabled_message',
		onPress: () => {
			console.log('출석체크로 이동');
		},
	},
	{
		id: 'moment-daily-roulette',
		titleComponent: <RouletteTitle />,
		descriptionKey: 'features.moment.navigation.roulette_description',
		backgroundImageUrl: require('@/assets/images/moment/menu/roulette.webp'),
		disabledTextKey: 'features.moment.navigation.roulette_disabled_text',
		disabledMessageKey: 'features.moment.navigation.roulette_disabled_message',
		onPress: () => {
			router.push('/moment/daily-roulette');
		},
	},
	{
		id: 'moment-somemate',
		titleComponent: <SomemateTitle />,
		descriptionKey: 'features.moment.navigation.somemate_description',
		backgroundImageUrl: require('@/assets/images/moment/menu/persona.webp'),
		onPress: () => {
			router.push('/chat/somemate');
		},
	},
	{
		id: 'moment-ideal-type-test',
		titleComponent: <IdealTypeTestNavTitle />,
		descriptionKey: 'features.moment.navigation.ideal_type_test_description',
		backgroundImageUrl: require('@/assets/images/ideal-type-test/gift-heart.png'),
		onPress: () => {
			router.push('/moment/ideal-type-test');
		},
	},
	{
		id: 'moment-weekly-report',
		titleComponent: <WeeklyReportTitle />,
		descriptionKey: 'features.moment.navigation.weekly_report_description',
		backgroundImageUrl: require('@/assets/images/moment/menu/moment.webp'),
		onPress: () => {
			router.push('/moment/weekly-report');
		},
	},
];
