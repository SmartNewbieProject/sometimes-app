import colors from '@/src/shared/constants/colors';
import { Image as ExpoImage } from 'expo-image';
import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

interface MarkdownRendererProps {
	content: string;
}

type BlockType =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'paragraph'
	| 'blockquote'
	| 'image'
	| 'divider'
	| 'list'
	| 'orderedList'
	| 'callout';

interface Block {
	type: BlockType;
	content: string;
	items?: string[];
	calloutType?: 'tip' | 'warning' | 'info';
}

// 마크다운 파싱
const parseMarkdown = (content: string): Block[] => {
	const lines = content.split('\n');
	const blocks: Block[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// 빈 줄 스킵
		if (!line.trim()) {
			i++;
			continue;
		}

		// 콜아웃 시작 (:::tip, :::warning, :::info)
		const calloutMatch = line.match(/^:::(tip|warning|info)\s*$/);
		if (calloutMatch) {
			const calloutType = calloutMatch[1] as 'tip' | 'warning' | 'info';
			const calloutContent: string[] = [];
			i++;
			while (i < lines.length && !lines[i].match(/^:::\s*$/)) {
				calloutContent.push(lines[i]);
				i++;
			}
			blocks.push({
				type: 'callout',
				content: calloutContent.join('\n'),
				calloutType,
			});
			i++;
			continue;
		}

		// 헤더
		if (line.startsWith('### ')) {
			blocks.push({ type: 'h3', content: line.slice(4) });
			i++;
			continue;
		}
		if (line.startsWith('## ')) {
			blocks.push({ type: 'h2', content: line.slice(3) });
			i++;
			continue;
		}
		if (line.startsWith('# ')) {
			blocks.push({ type: 'h1', content: line.slice(2) });
			i++;
			continue;
		}

		// 구분선
		if (line.match(/^---+$/)) {
			blocks.push({ type: 'divider', content: '' });
			i++;
			continue;
		}

		// 인용문
		if (line.startsWith('> ')) {
			const quoteLines: string[] = [line.slice(2)];
			i++;
			while (i < lines.length && lines[i].startsWith('> ')) {
				quoteLines.push(lines[i].slice(2));
				i++;
			}
			blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
			continue;
		}

		// 이미지
		const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
		if (imageMatch) {
			blocks.push({ type: 'image', content: imageMatch[2] });
			i++;
			continue;
		}

		// 순서 없는 리스트
		if (line.match(/^[-*]\s/)) {
			const items: string[] = [line.replace(/^[-*]\s/, '')];
			i++;
			while (i < lines.length && lines[i].match(/^[-*]\s/)) {
				items.push(lines[i].replace(/^[-*]\s/, ''));
				i++;
			}
			blocks.push({ type: 'list', content: '', items });
			continue;
		}

		// 순서 있는 리스트
		if (line.match(/^\d+\.\s/)) {
			const items: string[] = [line.replace(/^\d+\.\s/, '')];
			i++;
			while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
				items.push(lines[i].replace(/^\d+\.\s/, ''));
				i++;
			}
			blocks.push({ type: 'orderedList', content: '', items });
			continue;
		}

		// 일반 텍스트 (paragraph)
		blocks.push({ type: 'paragraph', content: line });
		i++;
	}

	return blocks;
};

// 인라인 스타일 적용 (bold, italic, link)
const renderInlineStyles = (text: string): React.ReactNode[] => {
	const elements: React.ReactNode[] = [];
	let lastIndex = 0;
	let key = 0;

	// 링크, 볼드, 이탤릭 패턴
	const patterns = [
		{ regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
		{ regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
		{ regex: /\*([^*]+)\*/g, type: 'italic' },
	];

	// 모든 매치를 찾아서 정렬
	const matches: Array<{
		start: number;
		end: number;
		type: string;
		text: string;
		url?: string;
	}> = [];

	for (const { regex, type } of patterns) {
		let match: RegExpExecArray | null;
		regex.lastIndex = 0;
		while ((match = regex.exec(text)) !== null) {
			matches.push({
				start: match.index,
				end: match.index + match[0].length,
				type,
				text: type === 'link' ? match[1] : match[1],
				url: type === 'link' ? match[2] : undefined,
			});
		}
	}

	// 시작 위치로 정렬
	matches.sort((a, b) => a.start - b.start);

	// 겹치지 않는 매치만 유지
	const filteredMatches: typeof matches = [];
	let lastEnd = 0;
	for (const match of matches) {
		if (match.start >= lastEnd) {
			filteredMatches.push(match);
			lastEnd = match.end;
		}
	}

	// 렌더링
	for (const match of filteredMatches) {
		// 매치 이전 텍스트
		if (match.start > lastIndex) {
			elements.push(<Text key={key++}>{text.slice(lastIndex, match.start)}</Text>);
		}

		// 매치된 부분
		if (match.type === 'link' && match.url) {
			elements.push(
				<Text key={key++} style={styles.link} onPress={() => Linking.openURL(match.url!)}>
					{match.text}
				</Text>,
			);
		} else if (match.type === 'bold') {
			elements.push(
				<Text key={key++} style={styles.bold}>
					{match.text}
				</Text>,
			);
		} else if (match.type === 'italic') {
			elements.push(
				<Text key={key++} style={styles.italic}>
					{match.text}
				</Text>,
			);
		}

		lastIndex = match.end;
	}

	// 나머지 텍스트
	if (lastIndex < text.length) {
		elements.push(<Text key={key++}>{text.slice(lastIndex)}</Text>);
	}

	return elements.length > 0 ? elements : [<Text key={0}>{text}</Text>];
};

// 블록 렌더링
const renderBlock = (block: Block, index: number): React.ReactNode => {
	switch (block.type) {
		case 'h1':
			return (
				<Text key={index} style={styles.h1}>
					{renderInlineStyles(block.content)}
				</Text>
			);
		case 'h2':
			return (
				<Text key={index} style={styles.h2}>
					{renderInlineStyles(block.content)}
				</Text>
			);
		case 'h3':
			return (
				<Text key={index} style={styles.h3}>
					{renderInlineStyles(block.content)}
				</Text>
			);
		case 'paragraph':
			return (
				<Text key={index} style={styles.paragraph}>
					{renderInlineStyles(block.content)}
				</Text>
			);
		case 'blockquote':
			return (
				<View key={index} style={styles.blockquote}>
					<Text style={styles.blockquoteText}>{renderInlineStyles(block.content)}</Text>
				</View>
			);
		case 'image':
			return (
				<ExpoImage
					key={index}
					source={{ uri: block.content }}
					style={styles.image}
					contentFit="cover"
				/>
			);
		case 'divider':
			return <View key={index} style={styles.divider} />;
		case 'list':
			return (
				<View key={index} style={styles.list}>
					{block.items?.map((item, i) => (
						<View key={i} style={styles.listItem}>
							<Text style={styles.listBullet}>•</Text>
							<Text style={styles.listText}>{renderInlineStyles(item)}</Text>
						</View>
					))}
				</View>
			);
		case 'orderedList':
			return (
				<View key={index} style={styles.list}>
					{block.items?.map((item, i) => (
						<View key={i} style={styles.listItem}>
							<Text style={styles.listNumber}>{i + 1}.</Text>
							<Text style={styles.listText}>{renderInlineStyles(item)}</Text>
						</View>
					))}
				</View>
			);
		case 'callout':
			return (
				<View
					key={index}
					style={[
						styles.callout,
						block.calloutType === 'tip' && styles.calloutTip,
						block.calloutType === 'warning' && styles.calloutWarning,
						block.calloutType === 'info' && styles.calloutInfo,
					]}
				>
					<Text style={styles.calloutLabel}>
						{block.calloutType === 'tip' && '💡 팁'}
						{block.calloutType === 'warning' && '⚠️ 주의'}
						{block.calloutType === 'info' && 'ℹ️ 정보'}
					</Text>
					<Text style={styles.calloutText}>{renderInlineStyles(block.content)}</Text>
				</View>
			);
		default:
			return null;
	}
};

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
	const blocks = useMemo(() => parseMarkdown(content), [content]);

	return <View style={styles.container}>{blocks.map((block, i) => renderBlock(block, i))}</View>;
};

const styles = StyleSheet.create({
	container: {
		gap: 16,
	},
	h1: {
		fontSize: 24,
		fontWeight: '700',
		color: colors.text.primary,
		lineHeight: 32,
	},
	h2: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.text.primary,
		lineHeight: 28,
		marginTop: 8,
	},
	h3: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.text.primary,
		lineHeight: 26,
		marginTop: 4,
	},
	paragraph: {
		fontSize: 16,
		color: colors.text.secondary,
		lineHeight: 26,
	},
	bold: {
		fontWeight: '700',
	},
	italic: {
		fontStyle: 'italic',
	},
	link: {
		color: colors.brand.primary,
		textDecorationLine: 'underline',
	},
	blockquote: {
		borderLeftWidth: 4,
		borderLeftColor: colors.brand.primary,
		backgroundColor: colors.surface.secondary,
		paddingLeft: 16,
		paddingVertical: 12,
		paddingRight: 12,
		borderRadius: 4,
	},
	blockquoteText: {
		fontSize: 16,
		color: colors.text.secondary,
		lineHeight: 24,
		fontStyle: 'italic',
	},
	image: {
		width: '100%',
		height: 200,
		borderRadius: 12,
	},
	divider: {
		height: 1,
		backgroundColor: colors.border.smooth,
		marginVertical: 8,
	},
	list: {
		gap: 8,
	},
	listItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	listBullet: {
		fontSize: 16,
		color: colors.brand.primary,
		marginRight: 8,
		lineHeight: 26,
	},
	listNumber: {
		fontSize: 16,
		color: colors.brand.primary,
		marginRight: 8,
		lineHeight: 26,
		fontWeight: '600',
	},
	listText: {
		flex: 1,
		fontSize: 16,
		color: colors.text.secondary,
		lineHeight: 26,
	},
	callout: {
		padding: 16,
		borderRadius: 12,
		gap: 8,
	},
	calloutTip: {
		backgroundColor: '#F0FDF4',
		borderLeftWidth: 4,
		borderLeftColor: '#22C55E',
	},
	calloutWarning: {
		backgroundColor: '#FFFBEB',
		borderLeftWidth: 4,
		borderLeftColor: '#F59E0B',
	},
	calloutInfo: {
		backgroundColor: colors.surface.secondary,
		borderLeftWidth: 4,
		borderLeftColor: colors.brand.primary,
	},
	calloutLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text.primary,
	},
	calloutText: {
		fontSize: 15,
		color: colors.text.secondary,
		lineHeight: 24,
	},
});
