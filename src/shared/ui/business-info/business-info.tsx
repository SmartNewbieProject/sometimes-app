import { Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../text';
import { useTranslation } from 'react-i18next';
import { isJapanese } from '@/src/shared/libs/local';
import { JP_LEGAL_LINKS } from '@/src/shared/constants/jp-legal-links';

export const BusinessInfo: React.FC = () => {
	const onClickLink = (link: string) => {
		Linking.openURL(link);
	};

	const { t } = useTranslation();
	const isJP = isJapanese();
	const businessRegistrationLink = 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=4980502914';

	if (isJP) {
		return (
			<View style={styles.container}>
				<View style={styles.linksRow}>
					<TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.termsOfService)}>
						<Text style={styles.linkText}>{t('jp_legal.terms_of_service')}</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.privacyCollection)}>
						<Text style={styles.linkText}>{t('jp_legal.privacy_collection')}</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.ageVerification)}>
						<Text style={styles.linkText}>{t('jp_legal.age_verification')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.infoText}>
				상호명: 스마트 뉴비 | 사업장 소재지: 대전광역시 서구 갈마중로 7번길 42, 4동 407호 | 대표:
				전준영 | 사업자 등록번호: 498-05-02914 | 통신판매업신고: 제 2025-대전유성-0530호 | 문의전화:
				010-8465-2476 | 이메일: notify@smartnewb.com |{' '}
				<TouchableOpacity onPress={() => onClickLink(businessRegistrationLink)}>
					<Text style={styles.infoTextSmall}>{t('common.business_info_check')}</Text>
				</TouchableOpacity>{' '}
			</Text>
			<View style={styles.linksRow}>
				<TouchableOpacity
					onPress={() =>
						onClickLink('https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145')
					}
				>
					<Text style={styles.linkText}>
						{t('shareds.business-info.business_info.privacy_policy')}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() =>
						onClickLink(
							'https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145?pvs=7',
						)
					}
				>
					<Text style={styles.linkText}>
						{t('shareds.business-info.business_info.data_consent')}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() =>
						onClickLink('https://ruby-composer-6d2.notion.site/1cd1bbec5ba1805dbafbc9426a0aaa80')
					}
				>
					<Text style={styles.linkText}>
						{t('shareds.business-info.business_info.terms_of_service')}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'column',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 24,
		marginTop: 16,
		marginBottom: Platform.OS === 'android' ? 32 : 16,
	},
	infoText: {
		color: '#888',
		fontSize: 10,
		textAlign: 'center',
		lineHeight: 20,
	},
	infoTextSmall: {
		color: '#888',
		fontSize: 10,
	},
	linksRow: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
	},
	linkText: {
		color: '#888',
		fontSize: 10,
		textAlign: 'center',
		lineHeight: 20,
		textDecorationLine: 'underline',
	},
});
