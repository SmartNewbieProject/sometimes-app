import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useMyResult } from '@/src/features/ideal-type-test/queries';
import type { LanguageCode } from '@/src/features/ideal-type-test/types';
import colors from '@/src/shared/constants/colors';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

const titleStyle = {
	fontSize: 14,
	fontWeight: '600' as const,
	color: colors.black,
	lineHeight: 22,
};

export const IdealTypeTestNavTitle = () => {
	const { t, i18n } = useTranslation();
	const { isAuthorized } = useAuth();
	const currentLang = (i18n.language?.startsWith('ja') ? 'ja' : 'ko') as LanguageCode;
	const { data: myResult } = useMyResult({ lang: currentLang, enabled: isAuthorized });

	if (isAuthorized && myResult?.result) {
		return (
			<Text style={titleStyle}>
				{myResult.result.emoji} {myResult.result.name}
			</Text>
		);
	}

	return <Text style={titleStyle}>{t('features.moment.navigation.ideal_type_test_title')}</Text>;
};
