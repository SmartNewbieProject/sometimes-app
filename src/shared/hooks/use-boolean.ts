import { useCallback, useState } from 'react';

interface UseBooleanOutput {
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

export function useBoolean(initialValue = false): UseBooleanOutput {
  const [value, setValue] = useState<boolean>(initialValue);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle
  };
}
