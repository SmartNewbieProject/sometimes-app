import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LETTER_PROMPT_KEYS } from '../utils/letter-validator';

type LetterPromptsProps = {
	onSelect: (prompt: string) => void;
	prompts?: string[];
};

export function LetterPrompts({ onSelect, prompts = LETTER_PROMPT_KEYS }: LetterPromptsProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const handleToggle = () => {
		setIsExpanded(!isExpanded);
	};

	const handleSelect = (prompt: string, index: number) => {
		setSelectedIndex(index);
		onSelect(prompt);
		setIsExpanded(false);
	};

	return (
		<View style={styles.container}>
			<Pressable
				style={[styles.header, isExpanded && styles.headerExpanded]}
				onPress={handleToggle}
			>
				<View style={styles.headerContent}>
					<Feather name="sun" size={24} color="#F9A825" style={styles.icon} />
					<Text size="14" style={styles.headerText}>
						이런 문구는 어때요?
					</Text>
				</View>
				<Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#737275" />
			</Pressable>

			{isExpanded && (
				<View style={styles.promptsContainer}>
					{prompts.map((prompt, index) => (
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
					))}
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
		marginLeft: -6,
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
});
