import React, {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ModalOption,
  ModalOptionOrNull,
  ModalOptions,
} from "../providers/modal-provider";

function useCurrentModal() {
  const [currentModal, setCurrentModal] = useState<ModalOptionOrNull>(null);

  const modalSagaRef = useRef(modalSaga(setCurrentModal));

  useEffect(() => {
    modalSagaRef.current.next();
  }, []);

  const showModal = useCallback((options: ModalOptions) => {
    setTimeout(() => {
      modalSagaRef.current.next(options);
    }, 0);
  }, []);

  const showErrorModal = useCallback(
    (message: string, type: "announcement" | "error") => {
      setTimeout(() => {
        modalSagaRef.current.next({ message, type });
      }, 0);
    },
    []
  );
  const hideModal = useCallback(() => {
    modalSagaRef.current.next();
  }, []);

  return {
    currentModal,
    showErrorModal,
    showModal,
    hideModal,
  };
}
function* modalSaga(
  setCurrentModal: Dispatch<SetStateAction<ModalOptionOrNull>>
) {
  const queueModal: ModalOption[] = [];

  while (true) {
    const newModalOptions: ModalOption | undefined = yield;
    if (newModalOptions) {
      queueModal.push(newModalOptions);
      if (queueModal.length === 1) {
        setCurrentModal(newModalOptions);
      }
    } else {
      queueModal.shift();

      if (queueModal.length > 0) {
        setCurrentModal(queueModal[0]);
      } else {
        setCurrentModal(null);
      }
    }
  }
}

export default useCurrentModal;
