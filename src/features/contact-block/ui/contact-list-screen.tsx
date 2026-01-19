import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Input } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface MaskedContact {
	id: string;
	maskedPhone: string;
	name?: string;
}

interface ContactListScreenProps {
	contacts: MaskedContact[];
	onConfirm: (selectedIds: string[]) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

const maskPhoneNumber = (phone: string): string => {
	if (phone.length < 10) return phone;

	const cleaned = phone.replace(/\D/g, '');

	if (cleaned.length === 11) {
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}XX-XX${cleaned.slice(9, 11)}`;
	}

	if (cleaned.length === 10) {
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}XX-XX${cleaned.slice(8, 10)}`;
	}

	return phone.replace(/(\d{2})(\d+)(\d{2})/, '$1XX-XX$3');
};

const ContactItem: React.FC<{
	contact: MaskedContact;
	isSelected: boolean;
	onToggle: (id: string) => void;
}> = ({ contact, isSelected, onToggle }) => (
	<TouchableOpacity
		style={styles.contactItem}
		onPress={() => onToggle(contact.id)}
		activeOpacity={0.7}
	>
		<View style={styles.leftContent}>
			<Ionicons
				name={isSelected ? 'checkbox' : 'square-outline'}
				size={24}
				color={isSelected ? colors.primaryPurple : colors.lightGray}
			/>
			<View style={styles.avatarContainer}>
				<Image
					source={require('@/src/assets/images/contact-block/contact_icon.png')}
					style={styles.avatarImage}
					resizeMode="contain"
				/>
			</View>
			<View style={styles.contactInfo}>
				{contact.name && (
					<Text size="md" weight="semibold" textColor="black">
						{contact.name}
					</Text>
				)}
				<Text size="sm" textColor="gray">
					{contact.maskedPhone}
				</Text>
			</View>
		</View>
	</TouchableOpacity>
);

export const ContactListScreen: React.FC<ContactListScreenProps> = ({
	contacts,
	onConfirm,
	onCancel,
	isLoading = false,
}) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState('');

	// Initialize all selected by default
	useEffect(() => {
		setSelectedIds(new Set(contacts.map((c) => c.id)));
	}, [contacts]);

	const maskedContacts: MaskedContact[] = useMemo(() => {
		return contacts.map((contact) => ({
			...contact,
			maskedPhone: maskPhoneNumber(contact.maskedPhone),
		}));
	}, [contacts]);

	const filteredContacts = useMemo(() => {
		if (!searchQuery) return maskedContacts;
		const query = searchQuery.toLowerCase();
		return maskedContacts.filter(
			(c) =>
				c.name?.toLowerCase().includes(query) ||
				c.maskedPhone.replace(/-/g, '').includes(query) ||
				c.maskedPhone.includes(query),
		);
	}, [maskedContacts, searchQuery]);

	const toggleSelection = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	const handleSelectAll = () => {
		const allFilteredIds = filteredContacts.map((c) => c.id);
		const allFilteredSelected = allFilteredIds.every((id) => selectedIds.has(id));

		const newSelected = new Set(selectedIds);

		if (allFilteredSelected) {
			// Deselect all visible
			allFilteredIds.forEach((id) => newSelected.delete(id));
		} else {
			// Select all visible
			allFilteredIds.forEach((id) => newSelected.add(id));
		}
		setSelectedIds(newSelected);
	};

	const handleConfirm = () => {
		onConfirm(Array.from(selectedIds));
	};

	const isAllFilteredSelected =
		filteredContacts.length > 0 &&
		filteredContacts.every((c) => selectedIds.has(c.id));

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
			<View style={styles.header}>
				<Text size="lg" weight="bold" textColor="black">
					이 분들과는 마주치지 않아요
				</Text>
				<Text size="sm" textColor="gray" style={styles.headerSubtitle}>
					연락처에서 {contacts.length}명이 확인됐어요
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<Input
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder="이름 또는 전화번호 검색"
					size="md"
					containerStyle={styles.searchInput}
				/>
			</View>

			<View style={styles.selectionInfo}>
				<Text size="sm" weight="semibold" style={{ color: colors.primaryPurple }}>
					{selectedIds.size}명 선택됨
				</Text>
				<TouchableOpacity onPress={handleSelectAll}>
					<Text size="sm" textColor="gray">
						{isAllFilteredSelected ? '전체 해제' : '전체 선택'}
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={filteredContacts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<ContactItem
						contact={item}
						isSelected={selectedIds.has(item.id)}
						onToggle={toggleSelection}
					/>
				)}
				style={styles.list}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text size="md" textColor="gray" style={styles.emptyText}>
							{searchQuery
								? '검색 결과가 없어요.'
								: '연락처에서 썸타임 회원을 찾지 못했어요.'}
						</Text>
					</View>
				}
			/>

			<View style={styles.noticeCard}>
				<Text style={styles.noticeEmoji}>✨</Text>
				<Text size="md" textColor="black" style={styles.noticeText}>
					이 사람들 걱정 없이{'\n'}
					새로운 인연에만 집중할 수 있어요!
				</Text>
			</View>

			<View style={styles.buttonContainer}>
				<Button
					variant="primary"
					size="lg"
					width="full"
					onPress={handleConfirm}
					disabled={isLoading}
				>
					{isLoading
					? t('features.contact-block.ui.설정_중')
					: `${selectedIds.size}명 차단하기`}
				</Button>

				<Button
					variant="secondary"
					size="md"
					width="full"
					onPress={onCancel}
					style={styles.cancelButton}
				>
					다음에 할게요
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	header: {
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 16,
	},
	headerSubtitle: {
		marginTop: 4,
	},
	searchContainer: {
		paddingHorizontal: 24,
		paddingBottom: 16,
	},
	searchInput: {
		width: '100%',
	},
	selectionInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: semanticColors.border.smooth,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 24,
	},
	contactItem: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: semanticColors.border.smooth,
	},
	leftContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatarContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 12,
	},
	avatarImage: {
		width: 24,
		height: 24,
	},
	contactInfo: {
		marginLeft: 12,
		flex: 1,
	},
	emptyContainer: {
		paddingVertical: 40,
		alignItems: 'center',
	},
	emptyText: {
		textAlign: 'center',
		lineHeight: 22,
	},
	noticeCard: {
		marginHorizontal: 24,
		marginVertical: 16,
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 16,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	noticeEmoji: {
		fontSize: 24,
	},
	noticeText: {
		flex: 1,
		lineHeight: 22,
	},
	buttonContainer: {
		paddingHorizontal: 24,
		gap: 12,
	},
	cancelButton: {
		marginTop: 4,
	},
});
