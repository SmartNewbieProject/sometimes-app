import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Modal } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import ErrorFace from '@assets/icons/error-face.svg';

type ModalOptions = {
  title?: ReactNode;
  children: ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
};

type ErrorModalOptions = {
  message: string;
  type: 'announcement' | 'error';
};

type ModalContextType = {
  showModal: (options: ModalOptions) => void;
  showErrorModal: (message: string, type: 'announcement' | 'error') => void;
  hideModal: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [modalContent, setModalContent] = useState<ModalOptions | null>(null);
  const [errorContent, setErrorContent] = useState<ErrorModalOptions | null>(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModalContent(options);
    setErrorContent(null);
    setVisible(true);
  }, []);

  const showErrorModal = useCallback((message: string, type: 'announcement' | 'error') => {
    setErrorContent({ message, type });
    setModalContent(null);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
    setModalContent(null);
    setErrorContent(null);
  }, []);

  const renderErrorModal = () => (
    <View className="bg-white w-max-[468px] w-[300px] md:w-full rounded-2xl p-5">
      <View className="flex flex-row items-center gap-x-2 mb-4">
        <ErrorFace />
        <Text size="lg" weight="semibold" textColor="black">
          {errorContent?.type === 'error' ? '오류가 발생했어요.' : '안내'}
        </Text>
      </View>
      <Text className="text-center mb-4" weight="medium" textColor="black">
        {errorContent?.message}
      </Text>
      <Button variant="primary" onPress={hideModal} className="w-full rounded-md">
        네, 확인했어요
      </Button>
    </View>
  );

  const renderCustomModal = () => (
    <View className="bg-white w-max-[468px] w-[300px] md:w-full rounded-2xl p-5">
      {modalContent?.title && (
        <View className="mb-4">
          {typeof modalContent.title === 'string' ? (
            <Text size="lg" weight="semibold" textColor="black" className="text-center">
              {modalContent.title}
            </Text>
          ) : (
            modalContent.title
          )}
        </View>
      )}
      <View className="mb-4">
        {typeof modalContent?.children === 'string' ? (
          <Text className="text-center" weight="medium" textColor="black">
            {modalContent.children}
          </Text>
        ) : (
          modalContent?.children
        )}
      </View>
      <View className="flex flex-row gap-x-2">
        {modalContent?.secondaryButton && (
          <Button
            variant="secondary"
            onPress={() => {
              modalContent.secondaryButton?.onClick();
              hideModal();
            }}
            className="flex-1"
          >
            {modalContent.secondaryButton.text}
          </Button>
        )}
        {modalContent?.primaryButton && (
          <Button
            variant="primary"
            onPress={() => {
              modalContent.primaryButton?.onClick();
              hideModal();
            }}
            className="flex-1"
          >
            {modalContent.primaryButton.text}
          </Button>
        )}
      </View>
    </View>
  );

  return (
    <ModalContext.Provider value={{ showModal, showErrorModal, hideModal }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          {errorContent ? renderErrorModal() : renderCustomModal()}
        </View>
      </Modal>
    </ModalContext.Provider>
  );
} 