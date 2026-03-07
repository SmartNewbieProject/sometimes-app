import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
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
				<View style={styles.card}>
					<View style={styles.linksRow}>
						<TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.termsOfService)}>
							<Text style={styles.linkText}>{t('jp_legal.terms_of_service')}</Text>
						</TouchableOpacity>
						<View style={styles.separator} />
						<TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.privacyCollection)}>
							<Text style={styles.linkText}>{t('jp_legal.privacy_collection')}</Text>
						</TouchableOpacity>
						<View style={styles.separator} />
						<TouchableOpacity onPress={() => onClickLink(JP_LEGAL_LINKS.ageVerification)}>
							<Text style={styles.linkText}>{t('jp_legal.age_verification')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.infoText}>
					스마트 뉴비 | 대표: 전준영 | 사업자 등록번호: 498-05-02914{'\n'}
					통신판매업신고: 제2026-대전유성-0328호{'\n'}
					대전광역시 유성구 동서대로 125, S9동 한밭인큐베이터타운 405호{'\n'}
					010-8465-2476 · notify@smartnewb.com
				</Text>
				<TouchableOpacity
					onPress={() => onClickLink(businessRegistrationLink)}
					style={styles.registrationLink}
				>
					<Text style={styles.linkText}>{t('common.business_info_check')}</Text>
				</TouchableOpacity>
				<View style={styles.divider} />
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
					<View style={styles.separator} />
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
					<View style={styles.separator} />
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
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	card: {
		backgroundColor: '#F5F5F7',
		borderRadius: 12,
		padding: 14,
		gap: 8,
	},
	infoText: {
		color: '#999',
		fontSize: 10,
		lineHeight: 16,
	},
	registrationLink: {
		alignSelf: 'flex-start',
	},
	divider: {
		height: 1,
		backgroundColor: '#E5E5EA',
	},
	linksRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 4,
	},
	separator: {
		width: 1,
		height: 10,
		backgroundColor: '#D1D1D6',
	},
	linkText: {
		color: '#888',
		fontSize: 10,
		lineHeight: 16,
		textDecorationLine: 'underline',
	},
});
