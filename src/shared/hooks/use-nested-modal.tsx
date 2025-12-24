import { useCallback, useState } from "react";
import type {
  ModalOptionOrNull,
  ModalOptions,
} from "../providers/modal-types";

function useNestedModal() {
  const [nestedModal, setNestedModal] = useState<ModalOptionOrNull>(null);

  const showNestedModal = useCallback((options: ModalOptions) => {
    setNestedModal(options);
  }, []);

  const showNestedErrorModal = useCallback(
    (message: string, type: "announcement" | "error") => {
      setNestedModal({ message, type });
    },
    []
  );
  const hideNestedModal = useCallback(() => {
    setNestedModal(null);
  }, []);

  return {
    nestedModal,
    showNestedErrorModal,
    showNestedModal,
    hideNestedModal,
  };
}

export default useNestedModal;
