import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { UniversityName, dayUtils, getUnivLogo } from '@/src/shared/libs';
import { LinkifiedText, Text } from '@/src/shared/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Platform, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Comment as CommentType } from '../../types';

const CheckIcon = () => (
	<Svg width={12} height={12} viewBox="0 0 14 14" fill="none">
		<Path
			d="M11.6667 3.5L5.25002 9.91667L2.33335 7"
			stroke={semanticColors.brand.primary}
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

type CommentProps = {
	data: CommentType;
	style?: StyleProp<ViewStyle>;
};

export const Comment = ({ data, style }: CommentProps) => {
	const [imageUri, setImageUri] = useState<string>(() =>
		getUnivLogo(data.author.universityDetails.name as UniversityName),
	);
	const { t } = useTranslation();
	const author = data?.author;
	const isStaff = author?.isStaff === true;

	return (
		<View style={[styles.container, style]}>
			<View style={styles.avatarContainer}>
				<Image
					source={{ uri: imageUri }}
					style={[styles.avatar, isStaff && styles.staffAvatar]}
					onError={() => {
						setImageUri(getUnivLogo(UniversityName.한밭대학교));
					}}
				/>
			</View>

			<View style={styles.contentContainer}>
				<View style={styles.headerRow}>
					<Text size="13" textColor="black">
						{author.name}
					</Text>
					{isStaff && (
						<View style={styles.staffBadgeContainer}>
							<CheckIcon />
							<Text size="sm" style={styles.staffBadgeText}>
								{t('features.community.ui.user_profile.staff_badge')}
							</Text>
						</View>
					)}
					<Text size="sm" textColor="muted">
						{dayUtils.formatRelativeTime(data.updatedAt)}
					</Text>
				</View>
				<View style={styles.textContainer}>
					<LinkifiedText
						size="sm"
						textColor="black"
						style={[
							styles.contentText,
							{
								lineHeight: Platform.OS === 'ios' ? 18 : 20,
							},
						]}
					>
						{data.content}
					</LinkifiedText>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'row',
	},
	avatarContainer: {
		marginRight: 8,
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},
	staffAvatar: {
		borderWidth: 1.5,
		borderColor: semanticColors.brand.primaryLight,
	},
	contentContainer: {
		flex: 1,
		flexDirection: 'column',
		gap: 4,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		width: '100%',
	},
	staffBadgeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	staffBadgeText: {
		fontSize: 12,
		color: semanticColors.text.muted,
	},
	textContainer: {
		paddingTop: 6,
		flex: 1,
	},
	contentText: {
		flex: 1,
		flexWrap: 'wrap',
		flexShrink: 1,
	},
});
