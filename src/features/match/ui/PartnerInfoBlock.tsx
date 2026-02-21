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

interface PartnerInfoBlockProps {
	partner: UserProfile;
}

export const PartnerBasicInfo = ({ partner }: PartnerInfoBlockProps) => {
	const { t } = useTranslation();
	const basicInfoItems = [
		{
			icon: ImageResources.BEER,
			label:
				parser.getSingleOption(t('ui.음주_선호도'), partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		},
		{
			icon: ImageResources.SMOKE,
			label:
				parser.getSingleOption(t('ui.흡연_선호도'), partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		},
		{
			icon: ImageResources.TATOO,
			prefix: t('features.match.ui.partner_info_block.tattoo_prefix'),
			label:
				parser.getSingleOption(t('ui.문신_선호도'), partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		},
		{
			icon: ImageResources.AGE,
			prefix: t('features.match.ui.partner_info_block.preferred_age_prefix'),
			label:
				parser.getSingleOption(t('ui.선호_나이대'), partner.preferences) ??
				t('features.match.ui.partner_info_block.doesnt_matter'),
		},
	];

	if (partner.gender === 'MALE') {
		basicInfoItems.push({
			icon: ImageResources.ARMY,
			label:
				parser.getSingleOption(t('ui.군필_여부'), partner.characteristics) ??
				t('features.match.ui.partner_info_block.no_info'),
		});
	}

	return (
		<View style={styles.container}>
			<Text textColor="muted" style={styles.title}>
				{t('features.match.ui.partner_info_block.basic_info_title')}
			</Text>
			<View style={[styles.infoCard, { backgroundColor: semanticColors.surface.surface }]}>
				{basicInfoItems.map((info) => (
					<View key={info.label} style={styles.infoItem}>
						<ImageResource resource={info.icon} width={24} height={24} />
						<Text textColor="secondary" style={styles.infoText} numberOfLines={1}>
							{info.prefix && (
								<Text
									style={{
										color: semanticColors.text.secondary,
										fontSize: 14,
									}}
								>
									{info.prefix}
								</Text>
							)}
							{info.label}
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
		<View style={styles.mbtiContainer}>
			<MBTICard mbti={partner.mbti as MBTIType} showCompatibility={true} />
		</View>
	);
};

export const PartnerIdealType = ({ partner }: PartnerInfoBlockProps) => {
	const { i18n } = useTranslation();
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

	return (
		<View style={styles.idealTypeContainer}>
			<View style={styles.idealTypeCard}>
				<View style={styles.idealTypeContent}>
					{meta ? (
						<>
							<Text style={styles.idealTypeSubtitle}>{meta.subtitle}</Text>
							<Text style={styles.idealTypeName}>{name}</Text>
							<Text style={styles.idealTypeDescription}>{meta.description}</Text>
						</>
					) : (
						<>
							<Text style={styles.idealTypeName}>{name}</Text>
							<View style={styles.idealTypeTags}>
								{tags.map((tag: string) => (
									<Text key={tag} style={styles.idealTypeTag}>
										#{tag}
									</Text>
								))}
							</View>
						</>
					)}
				</View>
				<Image source={mascotImage} style={styles.idealTypeMascot} contentFit="contain" />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		paddingVertical: 24,
	},
	title: {
		fontSize: 18,
		marginBottom: 16,
	},
	infoCard: {
		borderRadius: 16,
		padding: 20,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	infoItem: {
		width: '48%',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	infoText: {
		marginLeft: 8,
		fontWeight: '500',
		fontSize: 14,
		flex: 1,
	},
	mbtiContainer: {
		paddingHorizontal: 20,
		paddingBottom: 24,
	},
	idealTypeContainer: {
		paddingHorizontal: 20,
		paddingBottom: 24,
	},
	idealTypeCard: {
		backgroundColor: '#F6F6F6',
		borderRadius: 20,
		borderWidth: 1.5,
		borderStyle: 'dashed',
		borderColor: semanticColors.brand.primary,
		paddingVertical: 20,
		paddingLeft: 21,
		paddingRight: 110,
		minHeight: 120,
		position: 'relative',
		overflow: 'hidden',
	},
	idealTypeContent: {
		flex: 1,
	},
	idealTypeSubtitle: {
		fontSize: 15,
		fontWeight: '500',
		color: '#303030',
		lineHeight: 20,
	},
	idealTypeName: {
		fontSize: 25,
		fontWeight: '600',
		color: semanticColors.brand.primary,
		lineHeight: 33,
		marginTop: 2,
	},
	idealTypeDescription: {
		fontSize: 10,
		fontWeight: '300',
		color: '#303030',
		lineHeight: 13,
		marginTop: 8,
	},
	idealTypeTags: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 8,
	},
	idealTypeTag: {
		fontSize: 12,
		fontWeight: '500',
		color: semanticColors.brand.primary,
	},
	idealTypeMascot: {
		position: 'absolute',
		right: 2,
		top: '50%',
		width: 103,
		height: 103,
		transform: [{ translateY: -51.5 }],
	},
});
