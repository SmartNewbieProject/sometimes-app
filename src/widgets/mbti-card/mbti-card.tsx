import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getMBTIIcon } from './mbti-assets';
import { getMBTIData } from './mbti-data';
import { styles } from './styles';
import type { MBTICardProps, MBTIType } from './types';

export const MBTICard: React.FC<MBTICardProps> = ({
	mbti,
	showCompatibility = true,
	onCompatibilityPress,
	style,
}) => {
	const { t } = useTranslation();

	if (!mbti) {
		return null;
	}

	const mbtiData = getMBTIData(mbti);
	const iconSource = getMBTIIcon(mbti);
	const title = t(`${mbtiData.i18nKey}.title`);
	const description = t(`${mbtiData.i18nKey}.description`);
	const compatibilityLabel = t('widgets.mbti-card.compatibility.label');

	const handleCompatibilityPress = (type: MBTIType) => {
		if (onCompatibilityPress) {
			onCompatibilityPress(type);
		}
	};

	return (
		<View style={[styles.container, style]}>
			{/* 상단 행: INTP+타이틀(왼쪽) + 아이콘(오른쪽) */}
			<View style={styles.headerRow}>
				<View style={styles.headerTextCol}>
					<Text style={styles.mbtiType}>{mbti}</Text>
					<Text style={styles.title}>{title}</Text>
				</View>
				<View style={styles.iconContainer}>
					<Image source={iconSource} style={styles.icon} resizeMode="contain" />
				</View>
			</View>

			{/* 설명 */}
			<Text style={styles.description}>{description}</Text>

			{/* 구분선 + 궁합 */}
			{showCompatibility && (
				<>
					<View style={styles.divider} />
					<View style={styles.compatibilityContainer}>
						<Text style={styles.compatibilityLabel}>✨ {compatibilityLabel}</Text>
						<View style={styles.compatibilityTagsContainer}>
							{mbtiData.compatibility.map((compatibleType) => {
								const TagComponent = onCompatibilityPress ? TouchableOpacity : View;
								return (
									<TagComponent
										key={compatibleType}
										style={styles.compatibilityTag}
										onPress={() => handleCompatibilityPress(compatibleType)}
										activeOpacity={onCompatibilityPress ? 0.7 : 1}
									>
										<Text style={styles.compatibilityTagText}>#{compatibleType}</Text>
									</TagComponent>
								);
							})}
						</View>
					</View>
				</>
			)}
		</View>
	);
};
