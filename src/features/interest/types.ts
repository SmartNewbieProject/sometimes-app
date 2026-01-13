export type AgeOption = 'SAME_AGE' | 'YOUNGER' | 'OLDER' | 'NO_PREFERENCE';
export type AgeOptionType = 'OLDER' | 'YOUNGER' | 'SAME_AGE' | 'ANY';

export interface AgeOptionData {
	value: string;
	label: string;
	type: AgeOptionType;
}
