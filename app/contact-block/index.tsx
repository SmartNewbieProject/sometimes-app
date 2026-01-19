import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  useContactBlock,
  contactService,
  type DeviceContact,
} from '@/src/features/contact-block';
import {
  IntroScreen,
  ContactListScreen,
  CompleteScreen,
  WebFallbackScreen,
} from '@/src/features/contact-block/ui';
import { isWeb } from '@/src/shared/libs/platform-utils';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header, Text } from '@/src/shared/ui';
import Layout from '@/src/features/layout';

type Step = 'intro' | 'list' | 'complete';

interface ContactForDisplay {
  id: string;
  maskedPhone: string;
  name?: string;
}

export default function ContactBlockScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [contacts, setContacts] = useState<ContactForDisplay[]>([]);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [blockedCount, setBlockedCount] = useState(0);

  const {
    syncContacts,
    isSyncing,
    toggleContactBlock,
    isUpdating,
  } = useContactBlock();

  if (isWeb) {
    return <WebFallbackScreen onBack={() => router.back()} />;
  }

  const handleRequestContacts = useCallback(async () => {
    const permission = await contactService.requestPermission();

    if (permission !== 'granted') {
      return;
    }

    const fetchedContacts = await contactService.getContacts();
    setDeviceContacts(fetchedContacts);

    const displayContacts: ContactForDisplay[] = fetchedContacts
      .map((contact: DeviceContact, index: number) => ({
        id: contact.id || `contact-${index}`,
        maskedPhone: contact.phoneNumbers[0] || '',
        name: contact.name || undefined,
      }))
      .filter((c: ContactForDisplay) => c.maskedPhone);

    setContacts(displayContacts);
    setStep('list');
  }, []);

  const handleConfirmBlock = useCallback(async (selectedIds: string[]) => {
    const selectedContacts = deviceContacts.filter(c => selectedIds.includes(c.id));
    const contacts = contactService.normalizeContacts(selectedContacts);

    const result = await syncContacts(contacts);

    if (result) {
      setBlockedCount(result.matchedCount);
      await toggleContactBlock(true);
      setStep('complete');
    }
  }, [deviceContacts, syncContacts, toggleContactBlock]);

  const handleSkip = useCallback(() => {
    router.back();
  }, [router]);

  const handleComplete = useCallback(() => {
    router.replace('/home');
  }, [router]);

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <IntroScreen
            onRequestContacts={handleRequestContacts}
            onSkip={handleSkip}
            isLoading={false}
          />
        );

      case 'list':
        return (
          <ContactListScreen
            contacts={contacts}
            onConfirm={handleConfirmBlock}
            onCancel={handleSkip}
            isLoading={isSyncing || isUpdating}
          />
        );

      case 'complete':
        return (
          <CompleteScreen
            blockedCount={blockedCount}
            onComplete={handleComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout.Default style={styles.container}>
      <Header.Container style={styles.headerContainer}>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} style={styles.arrowContainer}>
            <View style={styles.backArrow} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="bold" textColor="black">
            지인 차단
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <View style={{ width: 24 }} />
        </Header.RightContent>
      </Header.Container>
      {renderContent()}
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  headerContainer: {
    alignItems: 'center',
  },
  backArrow: {
    width: 12.6,
    height: 12.6,
    top: 3,
    left: 3,
    position: 'absolute',
    borderLeftWidth: 2,
    borderLeftColor: '#000',
    borderTopWidth: 2,
    borderTopColor: '#000',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 2,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});
