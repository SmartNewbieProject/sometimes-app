import { Text } from '@/src/shared/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

interface MatchingReasonCardProps {
	reasons: string[];
	keywords: string[];
}

export const MatchingReasonCard = ({ reasons, keywords }: MatchingReasonCardProps) => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			{/* 상단 바: 타이틀 + 우표 아이콘 */}
			<View style={styles.topBar}>
				<Text style={styles.sectionTitle}>
					✨ {t('features.match.ui.matching_reason_placeholder.title')}
				</Text>
				<View style={styles.stamp}>
					<Text style={styles.stampEmoji}>💌</Text>
				</View>
			</View>

			{/* 편지 카드 */}
			<View style={styles.letterCard}>
				{/* 보라 스트라이프 */}
				<View style={styles.stripe} />

				{/* 편지 본문 */}
				<View style={styles.letterContent}>
					{reasons.map((reason, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: reasons are static per render
						<Text key={index} style={styles.reasonText}>
							{reason}
						</Text>
					))}

					{/* 서명 */}
					<Text style={styles.signature}>
						— {t('features.match.ui.matching_reason_card.signature')} 🦊
					</Text>
				</View>
			</View>

			{/* 키워드 섹션 (항상 노출) */}
			{keywords.length > 0 && (
				<View style={styles.kwSection}>
					<Text style={styles.kwIcon}>🔍</Text>
					{keywords.map((keyword, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: keywords are static per render
						<View key={index} style={styles.kwTag}>
							<Text style={styles.kwHash}>#</Text>
							<Text style={styles.kwTagText}>{keyword}</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#efefef',
	},
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
	},
	sectionTitle: {
		fontSize: 12,
		fontWeight: '700',
		color: '#7A4AE2',
	},
	stamp: {
		width: 36,
		height: 36,
		borderWidth: 2,
		borderColor: '#c4b3f0',
		borderStyle: 'dashed',
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stampEmoji: {
		fontSize: 18,
	},
	letterCard: {
		backgroundColor: '#FEFEFE',
		borderWidth: 1,
		borderColor: '#ececec',
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 1,
	},
	stripe: {
		height: 4,
		backgroundColor: '#7A4AE2',
	},
	letterContent: {
		padding: 14,
	},
	reasonText: {
		fontSize: 14,
		lineHeight: 26,
		color: '#2c2c2e',
		fontStyle: 'italic',
	},
	signature: {
		textAlign: 'right',
		fontSize: 12,
		color: '#b0b0b0',
		fontStyle: 'italic',
		marginTop: 10,
	},
	kwSection: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 12,
		alignItems: 'center',
	},
	kwIcon: {
		fontSize: 12,
		color: '#8e8e93',
	},
	kwTag: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		paddingHorizontal: 10,
		paddingVertical: 3,
		alignItems: 'center',
	},
	kwHash: {
		fontSize: 11.5,
		fontWeight: '700',
		color: '#7A4AE2',
	},
	kwTagText: {
		fontSize: 11.5,
		fontWeight: '500',
		color: '#555',
	},
});
