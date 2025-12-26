import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';

interface MaskedContact {
  id: string;
  maskedPhone: string;
  name?: string;
}

interface ContactListScreenProps {
  contacts: MaskedContact[];
  onConfirm: () => void;
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

const ContactItem: React.FC<{ contact: MaskedContact }> = ({ contact }) => (
  <View style={styles.contactItem}>
    <View style={styles.avatarContainer}>
      <Text style={styles.avatarIcon}>👤</Text>
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
);

export const ContactListScreen: React.FC<ContactListScreenProps> = ({
  contacts,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();

  const maskedContacts: MaskedContact[] = contacts.map(contact => ({
    ...contact,
    maskedPhone: maskPhoneNumber(contact.maskedPhone),
  }));

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

      <FlatList
        data={maskedContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactItem contact={item} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text size="md" textColor="gray" style={styles.emptyText}>
              연락처에서 썸타임 회원을 찾지 못했어요.{'\n'}
              그래도 안심 설정을 켜두시면{'\n'}
              나중에 가입하는 분들도 자동으로 차단돼요!
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
          onPress={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? '설정 중...' : '좋아요, 안심할게요!'}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: semanticColors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 20,
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
