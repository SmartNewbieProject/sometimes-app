import {
	getIdealTypeCardMeta,
	getIdealTypeCardMetaById,
	getResultMascotImage,
	getResultMascotImageByName,
	resolveResultTypeId,
} from '@/src/features/ideal-type-test/get-result-mascot-image';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources, parser } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import type { UserProfile } from '@/src/types/user';
import { MBTICard } from '@/src/widgets/mbti-card';
import type { MBTIType } from '@/src/widgets/mbti-card';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

const SECTION_TITLE_COLOR = '#7A4AE2';

interface PartnerInfoBlockProps {
	partner: UserProfile;
}

export const PartnerBasicInfo = ({ partner }: PartnerInfoBlockProps) => {
	const { t } = useTranslation();
	const basicInfoItems = [
		{
			icon: ImageResources.BEER,
			label:
				parser.getSingleOption('DRINKING', partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		},
		{
			icon: ImageResources.SMOKE,
			label:
				parser.getSingleOption('SMOKING', partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		},
		{
			icon: ImageResources.TATOO,
			prefix: t('features.match.ui.partner_info_block.tattoo_prefix'),
			label:
				parser.getSingleOption('TATTOO', partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		},
		{
			icon: ImageResources.AGE,
			prefix: t('features.match.ui.partner_info_block.preferred_age_prefix'),
			label:
				parser.getSingleOption('AGE_PREFERENCE', partner.preferences) ??
				t('features.match.ui.partner_info_block.doesnt_matter'),
		},
	];

	if (partner.gender === 'MALE') {
		basicInfoItems.push({
			icon: ImageResources.ARMY,
			label:
				parser.getSingleOption('MILITARY_STATUS_MALE', partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		});
	}

	return (
		<View style={styles.sectionDivider}>
			<Text style={styles.sectionTitle}>
				{t('features.match.ui.partner_info_block.basic_info_title')}
			</Text>
			<View style={styles.chipsRow}>
				{basicInfoItems.map((info) => (
					<View key={info.label} style={styles.chip}>
						<ImageResource resource={info.icon} width={16} height={16} />
						<Text style={styles.chipText} numberOfLines={1}>
							{info.prefix ? `${info.prefix} ${info.label}` : info.label}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

export const PartnerMBTI = ({ partner }: PartnerInfoBlockProps) => {
	if (!partner.mbti) {
		return null;
	}

	return (
		<View style={styles.sectionDivider}>
			<Text style={styles.sectionTitle}>MBTI</Text>
			<MBTICard mbti={partner.mbti as MBTIType} showCompatibility={true} />
		</View>
	);
};

export const PartnerIdealType = ({ partner }: PartnerInfoBlockProps) => {
	const { i18n, t } = useTranslation();
	const lang = i18n.language ?? 'ko';

	if (!partner.idealTypeResult) {
		return null;
	}

	const { id, name, tags } = partner.idealTypeResult;

	// id 기반 조회 (primary), name 기반 fallback
	const resultTypeId = id || resolveResultTypeId(name);
	const meta = resultTypeId
		? getIdealTypeCardMetaById(resultTypeId, lang)
		: getIdealTypeCardMeta(name, lang);
	const mascotImage = resultTypeId
		? getResultMascotImage(resultTypeId)
		: getResultMascotImageByName(name);

	const displayTags = tags?.length > 0 ? tags : meta ? [meta.subtitle].filter(Boolean) : [];

	return (
		<View style={styles.sectionDivider}>
			<View style={styles.idealTypeHeader}>
				<View style={{ flex: 1 }}>
					<Text style={styles.sectionTitle}>
						{t('features.match.ui.partner_info_block.ideal_type_title') ?? '이상형'}
					</Text>
					<Text style={styles.idealTypeName}>{name}</Text>
					{meta?.description ? (
						<Text style={styles.idealTypeDescription}>{meta.description}</Text>
					) : null}
				</View>
				{mascotImage ? (
					<Image source={mascotImage} style={styles.idealTypeMascotSmall} contentFit="contain" />
				) : null}
			</View>
			{displayTags.length > 0 && (
				<View style={styles.chipsRow}>
					{displayTags.map((tag: string) => (
						<View key={tag} style={styles.chip}>
							<Text style={styles.chipText}>#{tag}</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	sectionDivider: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: '600',
		color: SECTION_TITLE_COLOR,
		marginBottom: 10,
	},
	chipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: '#F8F9FA',
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	chipText: {
		fontSize: 13,
		fontWeight: '500',
		color: '#303030',
	},
	idealTypeHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	idealTypeName: {
		fontSize: 20,
		fontWeight: '600',
		color: semanticColors.brand.primary,
		lineHeight: 26,
		marginTop: 2,
	},
	idealTypeDescription: {
		fontSize: 12,
		fontWeight: '300',
		color: '#888',
		lineHeight: 16,
		marginTop: 4,
	},
	idealTypeMascotSmall: {
		width: 72,
		height: 72,
		marginLeft: 8,
	},
});
