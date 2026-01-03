import type { Preferences, PreferenceOption } from '@/src/features/interest/api';
import Loading from '@/src/features/loading';
import { ChipSelector } from '@/src/widgets';
import type { StyleProp, ViewStyle } from 'react-native';

interface PreferenceSelectorProps<T extends string | string[]> {
	preferences: Preferences;
	value?: T;
	multiple?: T extends string[] ? true : false;
	onChange: (value: T) => void;
	isLoading?: boolean;
	loadingTitle?: string;
	style?: StyleProp<ViewStyle>;
	mapOption?: (option: PreferenceOption) => {
		label: string;
		value: string;
		imageUrl?: string | null;
	};
}

export function PreferenceSelector<T extends string | string[]>({
	preferences,
	value,
	multiple = false as any,
	onChange,
	isLoading = false,
	loadingTitle,
	style,
	mapOption,
}: PreferenceSelectorProps<T>) {
	const defaultMapOption = (option: PreferenceOption) => ({
		label: option.displayName,
		value: option.id,
		imageUrl: option?.imageUrl,
	});

	const options = preferences?.options?.map(mapOption || defaultMapOption) ?? [];

	const handleChange = (newValue: string | string[]) => {
		onChange(newValue as T);
	};

	return (
		<Loading.Lottie title={loadingTitle} loading={isLoading}>
			{multiple ? (
				<ChipSelector
					value={value as string[]}
					options={options}
					multiple={true}
					onChange={handleChange as (value: string[]) => void}
					style={style}
				/>
			) : (
				<ChipSelector
					value={value as string}
					options={options}
					multiple={false}
					onChange={handleChange as (value: string) => void}
					style={style}
				/>
			)}
		</Loading.Lottie>
	);
}
