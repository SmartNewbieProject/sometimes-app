import * as Contacts from 'expo-contacts';
import * as Crypto from 'expo-crypto';
import type { DeviceContact, ContactPermissionStatus, BlockedContact } from '../types';

const SALT = process.env.EXPO_PUBLIC_CONTACT_SALT || 'contact-block-salt';

export const normalizePhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.startsWith('82') && digitsOnly.length >= 11) {
    return '0' + digitsOnly.slice(2);
  }

  if (digitsOnly.startsWith('010') || digitsOnly.startsWith('011')) {
    return digitsOnly;
  }

  return digitsOnly;
};

export const contactService = {
  async requestPermission(): Promise<ContactPermissionStatus> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status as ContactPermissionStatus;
  },

  async checkPermission(): Promise<ContactPermissionStatus> {
    const { status } = await Contacts.getPermissionsAsync();
    return status as ContactPermissionStatus;
  },

  async getContacts(): Promise<DeviceContact[]> {
    const permission = await this.checkPermission();

    if (permission !== 'granted') {
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    return data
      .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
      .map(contact => ({
        id: contact.id ?? '',
        name: contact.name ?? '',
        phoneNumbers: contact.phoneNumbers?.map(p => p.number ?? '').filter(Boolean) ?? [],
      }));
  },

  async getNormalizedPhoneNumbers(): Promise<string[]> {
    const contacts = await this.getContacts();
    const allPhoneNumbers = contacts.flatMap(c => c.phoneNumbers);
    const normalizedPhones = allPhoneNumbers.map(normalizePhoneNumber);
    const uniquePhones = Array.from(new Set(normalizedPhones));

    return uniquePhones.filter(phone => phone.length >= 10);
  },

  async getContactCount(): Promise<number> {
    const contacts = await this.getContacts();
    return contacts.length;
  },

  normalizeContacts(contacts: DeviceContact[]): string[] {
    const allPhoneNumbers = contacts.flatMap(c => c.phoneNumbers);
    const normalizedPhones = allPhoneNumbers.map(normalizePhoneNumber);
    const uniquePhones = Array.from(new Set(normalizedPhones));

    return uniquePhones.filter(phone => phone.length >= 10);
  },

  async hashPhoneNumber(phone: string): Promise<string> {
    const normalized = normalizePhoneNumber(phone);
    const text = `${normalized}${SALT}`;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      text
    );
    return hash;
  },

  async matchContacts(
    serverContacts: BlockedContact[],
    deviceContacts: DeviceContact[]
  ): Promise<Array<{ id: string; name: string; phoneNumber: string; createdAt: string }>> {
    // 1. Pre-calculate hashes for all device contacts
    // This could be slow for many contacts, so we might want to optimize or do it in chunks
    // For now, we'll try to do it efficiently

    const deviceMap = new Map<string, DeviceContact>();

    // Create a map of Hash -> DeviceContact
    // A single DeviceContact might have multiple phone numbers, so multiple hashes point to one name
    for (const contact of deviceContacts) {
      for (const phone of contact.phoneNumbers) {
        try {
          const hash = await this.hashPhoneNumber(phone);
          deviceMap.set(hash, contact);
        } catch (e) {
          console.error('Failed to hash phone number', e);
        }
      }
    }

    const matched = [];
    for (const serverContact of serverContacts) {
      if (serverContact.name && serverContact.phoneNumber) {
        matched.push({
          id: serverContact.id,
          name: serverContact.name,
          phoneNumber: serverContact.phoneNumber,
          createdAt: serverContact.createdAt,
        });
        continue;
      }

      const deviceContact = deviceMap.get(serverContact.phoneHash);
      if (deviceContact) {
        matched.push({
          id: serverContact.id, // ID from server (for unblocking)
          name: deviceContact.name,
          phoneNumber: deviceContact.phoneNumbers[0], // Display first number or matching number if we tracked it
          createdAt: serverContact.createdAt,
        });
      } else {
        // If not found in device, we can show "Unknown" or hide it.
        // The requirements say "Server has hashes only, client maps them".
        // If map fails, we probably populate with a placeholder or just hash
        matched.push({
          id: serverContact.id,
          name: '알 수 없음',
          phoneNumber: '', // Cannot recover phone from hash
          createdAt: serverContact.createdAt,
        });
      }
    }

    return matched;
  },
};
