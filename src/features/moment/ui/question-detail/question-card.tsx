import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { List, PenTool } from 'lucide-react-native';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import type { Question, QuestionType } from '../../types';
import { questionCardStyles } from './envelope.styles';

interface QuestionCardProps {
	question?: string;
	questionData?: Question;
	questionType?: 'text' | 'multiple-choice' | QuestionType;
	onTypeToggle: () => void;
	canProceed?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
	question,
	questionData,
	questionType = 'text',
	onTypeToggle,
	canProceed = true,
}) => {
	const { t } = useTranslation();

	// Get question text from either legacy question string or new questionData
	const getQuestionText = () => {
		if (questionData?.text) {
			return questionData.text;
		}
		return question || '';
	};

	const renderQuestionText = () => {
		const questionText = getQuestionText();

		if (!questionText || typeof questionText !== 'string') {
			return (
				<Text size="xl" weight="bold" textColor="primary" style={questionCardStyles.questionText}>
					{t('features.moment.question_detail.loading')}
				</Text>
			);
		}

		const lines = questionText.split('\n');
		return lines.map((line, index) => (
			<Text
				key={index}
				size="xl"
				weight="bold"
				textColor="primary"
				style={questionCardStyles.questionText}
			>
				{index === 2 ? <Text style={questionCardStyles.highlightText}>{line}</Text> : line}
				{'\n'}
			</Text>
		));
	};

	// Determine if question type supports toggling
	// 옵션이 있는 모든 질문에서 토글을 지원
	const hasOptions = questionData?.options && questionData.options.length > 0;
	const supportsToggle = hasOptions;
	const currentType = questionType; // 현재 UI 상태 기반으로 표시

	return (
		<View style={questionCardStyles.container}>
			<View style={questionCardStyles.badge}>
				<Text size="xs" weight="bold" textColor="purple">
					{canProceed
						? t('features.moment.question_detail.from_today')
						: t('common.질문에_대답했어요')}
				</Text>
			</View>

			{renderQuestionText()}

			{supportsToggle && (
				<TouchableOpacity
					style={questionCardStyles.toggleButton}
					onPress={onTypeToggle}
					activeOpacity={0.7}
				>
					{currentType === 'text' ? (
						<>
							<List size={14} color={semanticColors.text.muted} />
							<Text
								size="xs"
								weight="semibold"
								textColor="muted"
								style={questionCardStyles.toggleText}
							>
								{t('features.moment.question_detail.toggle_choice')}
							</Text>
						</>
					) : (
						<>
							<PenTool size={14} color={semanticColors.text.muted} />
							<Text
								size="xs"
								weight="semibold"
								textColor="muted"
								style={questionCardStyles.toggleText}
							>
								{t('features.moment.question_detail.toggle_text')}
							</Text>
						</>
					)}
				</TouchableOpacity>
			)}
		</View>
	);
};
