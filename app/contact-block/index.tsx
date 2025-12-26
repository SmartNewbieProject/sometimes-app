import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
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

    const deviceContacts = await contactService.getContacts();

    const displayContacts: ContactForDisplay[] = deviceContacts
      .slice(0, 50)
      .map((contact: DeviceContact, index: number) => ({
        id: contact.id || `contact-${index}`,
        maskedPhone: contact.phoneNumbers[0] || '',
        name: contact.name || undefined,
      }))
      .filter((c: ContactForDisplay) => c.maskedPhone);

    setContacts(displayContacts);
    setStep('list');
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    const result = await syncContacts();

    if (result) {
      setBlockedCount(result.matchedCount);
      await toggleContactBlock(true);
      setStep('complete');
    }
  }, [syncContacts, toggleContactBlock]);

  const handleSkip = useCallback(() => {
    router.back();
  }, [router]);

  const handleComplete = useCallback(() => {
    router.replace('/home');
  }, [router]);

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
}
