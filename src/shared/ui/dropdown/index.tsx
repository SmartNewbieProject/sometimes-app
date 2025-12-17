import React, { useRef, useState, useEffect } from 'react';
import {
	StyleSheet,
	View,
	Pressable,
	Platform,
	useWindowDimensions,
	type ViewStyle,
	type GestureResponderEvent,
	type LayoutRectangle,
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

export const Dropdown = ({ open, items, dropdownStyle, onOpenChange }: DropdownProps) => {
	const triggerRef = useRef<View>(null);
	const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();

	const handleClose = () => {
		onOpenChange?.(false);
	};

	const handleTriggerPress = (e: GestureResponderEvent) => {
		e.stopPropagation();
		if (open) {
			handleClose();
		} else {
			onOpenChange?.(true);
		}
	};

	// Measure trigger position ONLY for the backdrop
	useEffect(() => {
		if (open && triggerRef.current) {
			// We need global coordinates for the backdrop to cover the screen
			// regardless of where the dropdown is in the hierarchy.
			if (Platform.OS === 'web') {
				const element = triggerRef.current as unknown as HTMLElement;
				const rect = element.getBoundingClientRect();
				setTriggerLayout({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
			} else {
				triggerRef.current.measureInWindow((x, y, width, height) => {
					setTriggerLayout({ x, y, width, height });
				});
			}
		}
	}, [open, windowWidth, windowHeight]);

	const renderMenu = () => {
		return (
			<View
				style={[
					styles.menu,
					dropdownStyle,
					// Position relative to the trigger container
					{
						top: '100%', // Right below the trigger
						right: 0,    // Right aligned with the trigger
						marginTop: 4,
					},
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
						<Text className="text-[18px]" textColor="black">
							{item.content}
						</Text>
					</Pressable>
				))}
			</View>
		);
	};

	return (
		<View
			style={[
				styles.container,
				open && { zIndex: 9999 } // Ensure dropdown is on top when open
			]}
		>
			<Pressable
				ref={triggerRef}
				onPress={handleTriggerPress}
				style={styles.trigger}
				hitSlop={8}
			>
				<ImageResource resource={ImageResources.MENU} width={24} height={24} />
			</Pressable>

			{open && (
				<>
					{/* Backdrop: Positioned absolutely to cover the whole screen */}
					{/* We use negative margins/positions based on trigger layout to expand it */}
					{triggerLayout && (
						<Pressable
							style={[
								styles.backdrop,
								{
									top: -triggerLayout.y,
									left: -triggerLayout.x,
									width: windowWidth,
									height: windowHeight,
								}
							]}
							onPress={handleClose}
						/>
					)}

					{/* Menu: Rendered normally in the flow, positioned absolutely relative to container */}
					{renderMenu()}
				</>
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
	backdrop: {
		position: 'absolute',
		zIndex: -1, // Behind the menu but above other content (since container is zIndex 9999)
		backgroundColor: 'transparent', // Or 'rgba(0,0,0,0.1)' for debugging
		// @ts-ignore
		cursor: 'default',
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
});

export { styles as dropdownStyles };
