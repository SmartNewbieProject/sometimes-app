import * as Contacts from 'expo-contacts';
import type { DeviceContact, ContactPermissionStatus } from '../types';

const normalizePhoneNumber = (phone: string): string => {
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
};
