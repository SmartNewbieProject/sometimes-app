import { useStorage } from '@/src/shared/hooks/use-storage';

const STORAGE_KEY = 'has-completed-first-global-match';

export function useFirstGlobalMatch() {
	const { value, setValue, loading } = useStorage<boolean>({
		key: STORAGE_KEY,
		initialValue: false,
	});

	const isFirstGlobalMatch = !value;

	const completeFirstMatch = () => {
		setValue(true);
	};

	return {
		isFirstGlobalMatch,
		completeFirstMatch,
		loading,
	};
}
