import React, { useState } from 'react';
import {
	StyleSheet,
	View,
	Pressable,
	Modal,
	type ViewStyle,
	type GestureResponderEvent,
} from 'react-native';
import { ImageResource } from '../image-resource';
import { ImageResources } from '../../libs';
import { semanticColors } from '../../constants/semantic-colors';
import { Text } from '../text';

export type DropdownItem = {
	key: string;
	content: React.ReactNode;
	onPress: () => void;
};

type DropdownProps = {
	open: boolean;
	items: DropdownItem[];
	dropdownStyle?: ViewStyle;
	onOpenChange?: (isOpen: boolean) => void;
};

const DROPDOWN_WIDTH = 140;
const TRIGGER_SIZE = 32;

type MenuPosition = { top: number; left: number };

export const Dropdown = ({ open, items, dropdownStyle, onOpenChange }: DropdownProps) => {
	const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

	const handleClose = () => {
		onOpenChange?.(false);
	};

	const handleTriggerPress = (e: GestureResponderEvent) => {
		e.stopPropagation();
		if (open) {
			handleClose();
			return;
		}
		// pageX/pageY는 유저가 실제 누른 화면 좌표 — ref 측정과 달리 항상 정확
		const { pageX, pageY } = e.nativeEvent;
		// 탭 위치는 버튼 중앙 기준 → 버튼 우측 하단으로 메뉴 배치
		setMenuPosition({
			top: pageY + TRIGGER_SIZE / 2 + 4,
			left: pageX + TRIGGER_SIZE / 2 - DROPDOWN_WIDTH,
		});
		onOpenChange?.(true);
	};

	return (
		<View style={styles.container}>
			<Pressable onPress={handleTriggerPress} style={styles.trigger} hitSlop={8}>
				<ImageResource resource={ImageResources.MENU} width={24} height={24} />
			</Pressable>

			{open && menuPosition && (
				<Modal transparent visible animationType="none" onRequestClose={handleClose}>
					<Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose}>
						<View
							style={[
								styles.menu,
								dropdownStyle,
								{ position: 'absolute', top: menuPosition.top, left: menuPosition.left },
							]}
						>
							{items.map((item, index) => (
								<Pressable
									key={item.key}
									style={({ pressed }) => [
										styles.item,
										pressed && styles.itemPressed,
										index === items.length - 1 && { borderBottomWidth: 0 },
									]}
									onPress={(e) => {
										e.stopPropagation();
										item.onPress();
										handleClose();
									}}
								>
									<Text style={styles.itemText} textColor="black">
										{item.content}
									</Text>
								</Pressable>
							))}
						</View>
					</Pressable>
				</Modal>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		// zIndex is handled dynamically
	},
	trigger: {
		width: 32,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
		// @ts-ignore
		cursor: 'pointer',
	},
	menu: {
		position: 'absolute',
		width: DROPDOWN_WIDTH,
		backgroundColor: semanticColors.surface.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		overflow: 'hidden',
	},
	item: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f5f5f5',
		minHeight: 48,
		justifyContent: 'center',
	},
	itemPressed: {
		backgroundColor: '#f5f5f5',
	},
	itemText: {
		fontSize: 18,
	},
});

export { styles as dropdownStyles };
