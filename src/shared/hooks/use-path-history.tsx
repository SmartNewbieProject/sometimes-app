import { useStorage } from "./use-storage";

export const usePathHistory = () => {
  const { value } = useStorage({
    key: 'previous-path',
    initialValue: '/',
  });

  const getPreviousPath = (): string => value ?? '/';

  return { getPreviousPath };
};
