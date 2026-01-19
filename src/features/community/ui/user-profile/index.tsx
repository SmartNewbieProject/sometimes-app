import type { Author } from '@/src/features/community/types';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { type UniversityName, getUnivLogo } from '@/src/shared/libs/univ';
import { Show, Text } from '@/src/shared/ui';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_AVATAR = require('@assets/images/sometimelogo.webp');

const CheckIcon = () => (
	<Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
		<Path
			d="M11.6667 3.5L5.25002 9.91667L2.33335 7"
			stroke={semanticColors.brand.primary}
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

interface UserProfileProps {
	author: Author;
	universityName: UniversityName;
	isOwner: boolean;
	updatedAt?: ReactNode;
	hideUniv?: boolean;
	isArticleAuthor?: boolean;
}

export const UserProfile = ({
	author,
	universityName,
	isOwner,
	updatedAt,
	hideUniv = false,
	isArticleAuthor = false,
}: UserProfileProps) => {
	const [imageError, setImageError] = useState(false);
	const { t } = useTranslation();
	const logoUri = getUnivLogo(universityName);
	const isStaff = author.isStaff === true;

	return (
		<View style={styles.container}>
			<Image
				source={imageError || !logoUri ? DEFAULT_AVATAR : { uri: logoUri }}
				style={[styles.avatar, isStaff && styles.staffAvatar]}
				onError={() => setImageError(true)}
			/>

			<View style={styles.content}>
				<View style={styles.nameRow}>
					<View style={styles.nameColumn}>
						<View style={styles.nameWrapper}>
							<Text size="sm" weight="medium" textColor="black">
								{author.name}
							</Text>
							<Show when={isStaff}>
								<View style={styles.staffBadgeContainer}>
									<CheckIcon />
									<Text size="sm" style={styles.staffBadgeText}>
										{t('features.community.ui.user_profile.staff_badge')}
									</Text>
								</View>
							</Show>
							<Show when={isOwner && !isStaff}>
								<Text size="sm" style={styles.ownerBadge} textColor="pale-purple">
									(나)
								</Text>
							</Show>
							<Show when={isArticleAuthor && !isStaff}>
								<View style={styles.articleAuthorBadge}>
									<Text style={styles.articleAuthorBadgeText}>
										{t('features.community.ui.user_profile.article_author_badge', '글쓴이')}
									</Text>
								</View>
							</Show>
							<Show when={!!updatedAt}>
								<View style={styles.updatedAtWrapper}>
									<Text size="sm" textColor="pale-purple">
										{updatedAt}
									</Text>
								</View>
							</Show>
						</View>
					</View>
				</View>

				<Show when={!hideUniv}>
					<Text size="13" textColor="purple" style={styles.univText}>
						{author.age}
						<Text> · </Text>
						{universityName}
					</Text>
				</Show>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexShrink: 1,
		alignItems: 'center',
		marginBottom: 8,
		position: 'relative',
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 12,
		alignSelf: 'flex-start',
	},
	staffAvatar: {
		borderWidth: 1.5,
		borderColor: semanticColors.brand.primaryLight,
	},
	content: {
		flex: 1,
		position: 'relative',
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	nameColumn: {
		flexDirection: 'column',
		flex: 1,
	},
	nameWrapper: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	ownerBadge: {
		marginLeft: 4,
	},
	staffBadgeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 4,
		gap: 2,
	},
	staffBadgeText: {
		fontSize: 12,
		color: semanticColors.text.muted,
		fontWeight: '400',
	},
	updatedAtWrapper: {
		paddingLeft: 6,
	},
	univText: {
		opacity: 0.7,
	},
	articleAuthorBadge: {
		backgroundColor: '#e6dbff',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 15,
		marginLeft: 6,
	},
	articleAuthorBadgeText: {
		fontSize: 8.4,
		fontWeight: '600' as const,
		color: '#7a4ae2',
	},
});
