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
  imageUrl?: string;
}

export interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  mbti: string;
  gender: string;
  profileImages: ProfileImage[];
  instagramId: string;
  universityDetails: UniversityDetail;
  preferences: PreferenceTypeGroup[];
}

export interface SimpleProfile {
  universityName: string;
  authenticated: boolean;
  name: string;
  age: number;
  mbti: string;
}

export interface MyDetails {
  name: string;
  age: number;
  gender: Gender;
  phoneNumber: string;
  profileImages: ProfileImage[];
  instagramId: string;
  universityDetails: UniversityDetail;
}

export type Gender = 'MALE' | 'FEMALE';
