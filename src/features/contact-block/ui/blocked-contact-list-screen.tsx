import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, Input, Button } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import { contactBlockApi } from '../apis';
import { contactService } from '../services/contact.service';
import type { DeviceContact, BlockedContact } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '@/src/shared/hooks/use-toast';

interface DisplayContact {
  id: string; // Server Hash ID
  name: string;
  phoneNumber: string;
  createdAt: string;
}

export const BlockedContactListScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { emitToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [blockedContacts, setBlockedContacts] = useState<DisplayContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Initial Data Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      // 1. Get Device Contacts First
      const permission = await contactService.checkPermission();
      let contacts: DeviceContact[] = [];
      if (permission === 'granted') {
        contacts = await contactService.getContacts();
        setDeviceContacts(contacts);
      } else {
        // If no permission, we can still show hashes or prompt? 
        // Guide says: "If no permission, guide to settings"
        // For now, assume permission or empty list
      }

      // 2. Get Server Blocked Contacts (first page)
      await fetchBlockedContacts(1, contacts, true);
    } catch (error) {
      console.error(error);
      emitToast('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlockedContacts = async (pageNum: number, dContacts: DeviceContact[], reset: boolean = false) => {
    try {
      const response = await contactBlockApi.getBlockedContacts({ page: pageNum, limit: 20 });

      setHasMore(response.meta.hasMore);
      setPage(response.meta.page);

      // Match with device contacts
      const matched = await contactService.matchContacts(response.items, dContacts);

      setBlockedContacts(prev => reset ? matched : [...prev, ...matched]);
    } catch (error) {
      console.error(error);
      emitToast('차단 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isFetchingMore || isLoading) return;

    setIsFetchingMore(true);
    await fetchBlockedContacts(page + 1, deviceContacts);
    setIsFetchingMore(false);
  };

  const activeContacts = useMemo(() => {
    if (!searchQuery) return blockedContacts;
    const query = searchQuery.toLowerCase();

    return blockedContacts.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.phoneNumber.replace(/-/g, '').includes(query) ||
      c.phoneNumber.includes(query)
    );
  }, [blockedContacts, searchQuery]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleUnblock = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      '차단 해제',
      `${selectedIds.size}명의 차단을 해제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await contactBlockApi.unblockContacts(Array.from(selectedIds));

              if (result.success) {
                emitToast(result.message);
                setSelectedIds(new Set());
                // Reload list
                loadInitialData();
              }
            } catch (error) {
              emitToast('차단 해제에 실패했습니다.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: DisplayContact }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isSelected ? colors.primaryPurple : colors.lightGray}
          style={styles.checkbox}
        />
        <View style={styles.avatarContainer}>
          <Image
            source={require('@/src/assets/images/contact-block/contact_icon.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoContainer}>
          <Text size="md" weight="semibold" textColor="black">{item.name}</Text>
          {item.phoneNumber ? (
            <Text size="sm" textColor="gray">{item.phoneNumber}</Text>
          ) : (
            <Text size="sm" textColor="gray" style={{ fontStyle: 'italic' }}>번호 정보 없음</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="이름 또는 전화번호 검색"
          size="md"
        />
      </View>

      <View style={styles.actionContainer}>
        <Text size="sm" weight="semibold" style={{ color: colors.primaryPurple }}>
          {selectedIds.size}명 선택됨
        </Text>
        <TouchableOpacity onPress={handleUnblock} disabled={selectedIds.size === 0}>
          <Text
            size="sm"
            textColor={selectedIds.size > 0 ? 'black' : 'gray'}
            weight={selectedIds.size > 0 ? 'bold' : 'regular'}
          >
            선택 해제
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text size="md" textColor="gray">차단된 연락처가 없습니다.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          (isLoading || isFetchingMore) ? <ActivityIndicator style={{ padding: 20 }} /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  checkbox: {
    marginRight: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: semanticColors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
