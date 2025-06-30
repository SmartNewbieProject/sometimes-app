import { useEffect, useRef, useState } from 'react';
import {
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
	type ViewStyle,
} from 'react-native';
import { ImageResources } from '../../libs';
import { ImageResource } from '../image-resource';
import { Show } from '../show';
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
};

export const Dropdown = ({ open: _open, items, dropdownStyle }: DropdownProps) => {
	const [open, setOpen] = useState(_open);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
	const containerRef = useRef<View>(null);

	useEffect(() => {
		setOpen(_open);
	}, [_open]);

	useEffect(() => {
		if (Platform.OS === 'web' && typeof document !== 'undefined') {
			const handleOutsideClick = (event: Event) => {
				const target = event.target as HTMLElement;
				const isOutsideClick = !target.closest('.dropdown-container');

				if (open && isOutsideClick) {
					setOpen(false);
				}
			};
			document.addEventListener('click', handleOutsideClick, true);
			return () => {
				document.removeEventListener('click', handleOutsideClick, true);
			};
		}
	}, [open]);

	const handleToggle = () => {
		if (!open && containerRef.current) {
			containerRef.current.measure((fx, fy, width, height, px, py) => {
				setDropdownPosition({
					top: py + height + 4,
					right: px + width - 158,
				});
			});
		}
		setOpen(!open);
	};

	return (
		<View style={styles.container}>
			<TouchableWithoutFeedback onPress={handleToggle}>
				<View ref={containerRef} style={styles.triggerContainer}>
					<ImageResource resource={ImageResources.MENU} width={24} height={24} />
				</View>
			</TouchableWithoutFeedback>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				style={{ position: 'absolute' }}
				onRequestClose={() => setOpen(false)}
			>
				<TouchableWithoutFeedback onPress={() => setOpen(false)}>
					<View style={styles.overlay}>
						<TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
							<View
								style={[
									styles.dropdownContainer,
									dropdownStyle,
									{
										position: 'absolute',
										top: dropdownPosition.top,
										left: dropdownPosition.right,
									},
								]}
								className="dropdown-container"
							>
								{items.map((item, index) => (
									<Pressable
										key={item.key}
										style={[
											styles.dropdownItem,
											index === items.length - 1 && { borderBottomWidth: 0 },
										]}
										onPress={(e) => {
											e.preventDefault();
											e.stopPropagation();
											item.onPress();
											setOpen(false);
										}}
									>
										<Text className="text-[18px]" textColor="black">
											{item.content}
										</Text>
									</Pressable>
								))}
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		width: 32,
		height: 32,
		cursor: 'pointer',
	},
	triggerContainer: {
		width: 32,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
	overlay: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	dropdownContainer: {
		width: 140,
		paddingVertical: 4,
		borderRadius: 8,
		backgroundColor: 'white',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	dropdownItem: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f5f5f5',
		backgroundColor: 'white',
	},
});

export { styles as dropdownStyles };
