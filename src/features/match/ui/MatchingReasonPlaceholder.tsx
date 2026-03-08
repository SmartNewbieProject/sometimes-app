import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { StyleSheet, View } from 'react-native';

const NOTE_LINE_COUNT = 5;

// ─── 메인 컴포넌트 ────────────────────────────────────────
export const MatchingReasonPlaceholder = () => {
	return (
		<View style={styles.container}>
			{/* 섹션 헤더 */}
			<View style={styles.headerRow}>
				<Text style={styles.sectionTitle}>✨ 이 분과 매칭된 이유</Text>
			</View>

			{/* 편지지 영역 */}
			<View style={styles.letterArea}>
				{/* 왼쪽 빨간 세로선 */}
				<View style={styles.redLine} />

				{/* 배경 노트 줄 */}
				{Array.from({ length: NOTE_LINE_COUNT }).map((_, i) => (
					<View
						// biome-ignore lint/suspicious/noArrayIndexKey: 고정 배경 요소
						key={i}
						style={[styles.noteLine, { top: 20 + i * 32 }]}
					/>
				))}

				{/* 안내 내용 */}
				<View style={styles.contentArea}>
					<Text style={styles.mainMessage}>💌 매칭 사유가 상대방에게 보여져요!</Text>
					<Text style={styles.subMessage}>
						AI가 분석한 매칭 이유가{'\n'}상대방의 프로필에 표시됩니다
					</Text>
				</View>
			</View>

			{/* 하단 안내 */}
			<View style={styles.bottomHint}>
				<Text style={styles.hintText}>매칭 사유는 상대방에게만 공개됩니다</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFF8EE',
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 0,
		borderBottomWidth: 1,
		borderBottomColor: '#efefef',
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: '600',
		color: '#7A4AE2',
	},
	letterArea: {
		minHeight: 130,
		overflow: 'hidden',
		position: 'relative',
	},
	redLine: {
		position: 'absolute',
		left: 36,
		top: 0,
		bottom: 0,
		width: 1.5,
		backgroundColor: '#FF6B6B40',
		zIndex: 1,
	},
	noteLine: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: '#C8A86B30',
	},
	contentArea: {
		paddingTop: 12,
		paddingLeft: 52,
		paddingRight: 12,
		paddingBottom: 16,
		gap: 8,
		minHeight: 110,
		justifyContent: 'center',
	},
	mainMessage: {
		fontSize: 16,
		fontWeight: '700',
		color: semanticColors.text.primary,
		lineHeight: 24,
	},
	subMessage: {
		fontSize: 13,
		color: semanticColors.text.secondary,
		lineHeight: 20,
	},
	bottomHint: {
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: '#C8A86B30',
		alignItems: 'center',
	},
	hintText: {
		fontSize: 11,
		color: semanticColors.text.muted,
	},
});
