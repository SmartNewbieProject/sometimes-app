import {
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
} from "../providers/modal-types";

function useCurrentModal() {
  const [currentModal, setCurrentModal] = useState<ModalOptionOrNull>(null);

  const modalSagaRef = useRef(modalSaga(setCurrentModal));

  useEffect(() => {
    modalSagaRef.current.next();
  }, []);

  const showModal = useCallback((options: ModalOptions) => {
    modalSagaRef.current.next(options);
  }, []);

  const showErrorModal = useCallback(
    (message: string, type: "announcement" | "error") => {
      modalSagaRef.current.next({ message, type });
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
