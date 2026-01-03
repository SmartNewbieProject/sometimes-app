export type LikeOption = 'simple' | 'with_letter';

export type LikeOptionData = {
  type: LikeOption;
  cost: number;
  label: string;
  description?: string;
};

export type LetterWriteParams = {
  connectionId: string;
  nickname: string;
  profileUrl: string;
};

export type LetterPreviewData = {
  nickname: string;
  age: number;
  universityName: string;
  letter: string;
  profileUrl: string;
};
