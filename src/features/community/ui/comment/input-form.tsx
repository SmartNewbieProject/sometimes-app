import SendIcon from '@/assets/icons/send.svg';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import i18n from '@/src/shared/libs/i18n';
import { Check, Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Form } from '@/src/widgets/form';
import React from 'react';
import type { Control, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { CommentForm } from '../../types';

interface InputFormProps {
	checked: boolean;
	setChecked: (checked: boolean) => void;
	editingCommentId: string | null;
	handleCancelEdit: () => void;
	editingContent: string;
	setEditingContent: (content: string) => void;
	form: UseFormReturn<CommentForm>;
	handleSubmitUpdate: () => void;
	handleSubmit: (data: { content: string }) => void;
	replyTarget?: { id: string; authorName: string; content: string } | null;
	handleCancelReply?: () => void;
}

export const InputForm = ({
	checked,
	setChecked,
	editingCommentId,
	handleCancelEdit,
	editingContent,
	setEditingContent,
	form,
	handleSubmitUpdate,
	handleSubmit,
	replyTarget,
	handleCancelReply,
}: InputFormProps) => {
	const { t } = useTranslation();
	const currentContent = form.watch('content');

	return (
		<View>
			{editingCommentId && (
				<View style={styles.editingBanner}>
					<Text size="sm" textColor="accent">
						{t('features.community.ui.comment.input_form.editing_comment')}
					</Text>
					<TouchableOpacity onPress={handleCancelEdit}>
						<Text size="sm" textColor="accent">
							{t('cancel')}
						</Text>
					</TouchableOpacity>
				</View>
			)}
			{!editingCommentId && replyTarget && (
				<View style={styles.replyQuoteCard}>
					<View style={styles.replyQuoteLeft} />
					<View style={styles.replyQuoteBody}>
						<Text style={styles.replyQuoteAuthor} numberOfLines={1}>
							{replyTarget.authorName}{t('features.community.ui.comment.input_form.reply_to_suffix')}
						</Text>
						<Text style={styles.replyQuoteContent} numberOfLines={2}>
							{replyTarget.content}
						</Text>
					</View>
					{handleCancelReply && (
						<TouchableOpacity onPress={handleCancelReply} style={styles.replyQuoteClose}>
							<Text style={styles.replyQuoteCloseText}>×</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

			<View style={styles.inputContainer}>
				<View style={styles.leftSection}>
					{editingCommentId && <CancelEditButton onCancel={handleCancelEdit} />}
					{!editingCommentId && <AnonymousToggle checked={checked} setChecked={setChecked} />}
				</View>
				<View style={styles.inputWrapper}>
					<CommentInput
						control={form.control}
						editingCommentId={editingCommentId}
						editingContent={editingContent}
						setEditingContent={setEditingContent}
					/>
				</View>

				<SendButton
					onPress={editingCommentId ? handleSubmitUpdate : form.handleSubmit(handleSubmit)}
					disabled={!currentContent || !currentContent.trim()}
				/>
			</View>
		</View>
	);
};

const CancelEditButton = ({ onCancel }: { onCancel: () => void }) => (
	<TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
		<Text>{i18n.t('features.community.ui.comment.input_form.cancel')}</Text>
	</TouchableOpacity>
);

const AnonymousToggle = ({
	checked,
	setChecked,
}: {
	checked: boolean;
	setChecked: (checked: boolean) => void;
}) => (
	<>
		<Check.Box style={styles.checkBox} checked={checked} size={25} onChange={setChecked}>
			<Text style={styles.anonymousText}>
				{i18n.t('features.community.ui.comment.input_form.anonymous')}
			</Text>
		</Check.Box>
	</>
);

const CommentInput = ({
	control,
	editingCommentId,
	editingContent,
	setEditingContent,
}: {
	control: Control<CommentForm>;
	editingCommentId: string | null;
	editingContent: string;
	setEditingContent: (content: string) => void;
}) => (
	<Form.Input
		name="content"
		control={control}
		containerStyle={styles.commentInputContainer}
		textInputStyle={styles.commentInputText}
		placeholder={i18n.t('features.community.ui.comment.input_form.comment_placeholder')}
		placeholderTextColor={semanticColors.text.muted}
		returnKeyType="send"
		multiline={false}
		editable={true}
	/>
);

const SendButton = ({
	onPress,
	disabled,
}: {
	onPress: () => void;
	disabled: boolean;
}) => (
	<TouchableOpacity onPress={onPress} disabled={disabled} style={styles.sendButton}>
		<IconWrapper size={22}>
			<SendIcon />
		</IconWrapper>
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	editingBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginBottom: 8,
		borderRadius: 8,
	},
	replyQuoteCard: {
		flexDirection: 'row',
		alignItems: 'stretch',
		backgroundColor: colors.moreLightPurple,
		borderRadius: 10,
		marginBottom: 8,
		overflow: 'hidden',
		elevation: 0,
	},
	replyQuoteLeft: {
		width: 3,
		backgroundColor: '#7A4AE2',
		alignSelf: 'stretch',
	},
	replyQuoteBody: {
		flex: 1,
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	replyQuoteAuthor: {
		fontSize: 13,
		fontWeight: '700' as any,
		color: '#7A4AE2',
		marginBottom: 2,
	},
	replyQuoteContent: {
		fontSize: 12,
		color: semanticColors.text.secondary,
	},
	replyQuoteClose: {
		paddingHorizontal: 14,
		paddingVertical: 14,
		justifyContent: 'flex-start',
	},
	replyQuoteCloseText: {
		fontSize: 14,
		color: semanticColors.text.secondary,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		borderRadius: 16,
		backgroundColor: semanticColors.surface.background,
		height: 50,
		width: '100%',
	},
	leftSection: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	inputWrapper: {
		flex: 1,
	},
	cancelButton: {
		paddingLeft: 12,
		paddingBottom: 1,
	},
	checkBox: {
		paddingLeft: 12,
		height: 25,
	},
	anonymousText: {
		marginRight: 4,
		color: semanticColors.text.primary,
		fontSize: 15,
		height: 25,
		lineHeight: 25,
	},
	commentInputContainer: {
		flex: 1,
		borderBottomWidth: 0,
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 8,
		minHeight: 40,
		justifyContent: 'center',
	},
	commentInputText: {
		fontSize: 14,
		color: semanticColors.text.primary,
	},
	sendButton: {
		marginRight: 12,
	},
});
