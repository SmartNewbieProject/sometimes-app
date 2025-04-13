export interface ProfileImage {
  id: string;
  order: number;
  isMain: boolean;
  url: string;
}

export interface UniversityDetail {
  name: string;
  authentication: boolean;
  department: string;
  grade: string;
  studentNumber: string;
}

export interface PreferenceOption {
  id: string;
  displayName: string;
}

export interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  profileImages: ProfileImage[];
  instagramId: string | null;
  universityDetails: UniversityDetail | null;
  preferences: PreferenceTypeGroup[];
}

export type Gender = 'MALE' | 'FEMALE';
