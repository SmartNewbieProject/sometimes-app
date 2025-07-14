export type AgeOption = 'SAME_AGE' | 'YOUNGER' | 'OLDER' | 'NO_PREFERENCE';

export interface AgeOptionData {
	value: string;
	label: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	image: any;
}
