import { nanoid } from 'nanoid';

export const generateTempId = (): string => `temp_${nanoid(4)}`;

export const isTempId = (id: string): boolean => id.startsWith('temp_');
