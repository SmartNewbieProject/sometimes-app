import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { LETTER_PROMPT_KEYS } from '../utils/letter-validator';

import { useLetterPrompts } from '../hooks/use-letter-prompts';

type LetterPromptsProps = {
	connectionId: string;
	onSelect: (prompt: string, promptIndex?: number) => void;
};

export function LetterPrompts({ connectionId, onSelect }: LetterPromptsProps) {
	const { questions, isTimedOut, isFailed } = useLetterPrompts(connectionId);
	// questions가 없으면(아직 생성 중) 타임아웃/실패 전까지 항상 spinner 표시
	const isQuestionsLoading = questions.length === 0 && !isTimedOut && !isFailed;
	const prompts = questions.length > 0 ? questions : LETTER_PROMPT_KEYS;

	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const handleToggle = () => {
		setIsExpanded(!isExpanded);
	};

	const handleSelect = (prompt: string, index: number) => {
		setSelectedIndex(index);
		onSelect(prompt, index);
		setIsExpanded(false);
	};

	return (
		<View style={styles.container}>
			<Pressable
				style={[styles.header, isExpanded && styles.headerExpanded]}
				onPress={handleToggle}
			>
				<View style={styles.headerContent}>
					<Image
						source={require('@assets/images/like-letter/bulb.png')}
						style={styles.icon}
						contentFit="contain"
					/>
					<Text size="14" style={styles.headerText}>
						이런 문구는 어때요?
					</Text>
				</View>
				{isQuestionsLoading ? (
					<ActivityIndicator size="small" color={colors.primaryPurple} />
				) : (
					<Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#737275" />
				)}
			</Pressable>

			{isExpanded && (
				<View style={styles.promptsContainer}>
					{isQuestionsLoading ? (
						<View style={styles.loadingContainer}>
							<Text size="12" style={styles.loadingText}>
								딱 맞는 문구를 만들고 있어요 🪄
							</Text>
						</View>
					) : (
						prompts.map((prompt, index) => (
							<Pressable
								key={index}
								style={[styles.promptItem, selectedIndex === index && styles.promptItemSelected]}
								onPress={() => handleSelect(prompt, index)}
							>
								<Text
									size="12"
									style={[
										styles.promptText,
										selectedIndex === index ? styles.promptTextSelected : {},
									]}
								>
									{prompt}
								</Text>
							</Pressable>
						))
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	header: {
		backgroundColor: colors.white,
		borderRadius: 10,
		borderWidth: 0.5,
		borderColor: 'rgba(115, 114, 117, 0.4)',
		height: 44,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
	},
	headerExpanded: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	icon: {
		width: 20,
		height: 20,
	},
	headerText: {
		color: '#737275',
	},
	promptsContainer: {
		backgroundColor: colors.white,
		borderWidth: 0.5,
		borderTopWidth: 0,
		borderColor: 'rgba(115, 114, 117, 0.4)',
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
		paddingVertical: 8,
	},
	promptItem: {
		backgroundColor: '#FBF9FF',
		borderRadius: 10,
		marginHorizontal: 15,
		marginVertical: 4,
		paddingHorizontal: 16,
		paddingVertical: 6,
	},
	promptItemSelected: {
		backgroundColor: '#E1D9FF',
		borderWidth: 2,
		borderColor: colors.primaryPurple,
	},
	promptText: {
		color: '#737275',
		lineHeight: 18,
	},
	promptTextSelected: {
		color: colors.primaryPurple,
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 16,
	},
	loadingText: {
		color: '#737275',
	},
});
