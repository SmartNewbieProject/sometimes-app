export type AgeOption = 'SAME_AGE' | 'YOUNGER' | 'OLDER' | 'NO_PREFERENCE';

export interface AgeOptionData {
  value: AgeOption;
  label: string;
  image: any;
}
