import ModalParticle from "@/src/widgets/particle/modal-particle";
import ErrorFace from "@assets/icons/error-face.svg";
import Letter from "@assets/icons/letter.svg";
import { Image } from "expo-image";
import type React from "react";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { type LayoutChangeEvent, Modal, StyleSheet, View } from "react-native";
import { cn } from "../libs";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
type ModalOptions = {
  title?: ReactNode;
  customTitle?: ReactNode;
  children: ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
  };
  showParticle?: boolean;
  showLogo?: boolean;
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
};

type ErrorModalOptions = {
  message: string;
  type: "announcement" | "error";
};

type ModalContextType = {
  showModal: (options: ModalOptions) => void;
  showErrorModal: (message: string, type: "announcement" | "error") => void;
  hideModal: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const isClicked = useRef(false);
  const [modalContent, setModalContent] = useState<ModalOptions | null>(null);
  const [errorContent, setErrorContent] = useState<ErrorModalOptions | null>(
    null
  );
  const [queuedError, setQueuedError] = useState<ErrorModalOptions | null>(
    null
  );
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({
      width: width,
      height: height,
    });
  };

  const PARTICLE_IMAGE = [
    {
      source: require("@assets/images/particle2.png"),
      style: {
        width: 52,
        height: 49,
        marginLeft: -52 / 2,
        marginTop: -49 / 2,
      },
      angle: 40,
    },
    {
      source: require("@assets/images/particle3.png"),
      style: {
        width: 105,
        height: 80,
        marginLeft: -105 / 2,
        marginTop: -80 / 2,
      },
      angle: 70,
    },
    {
      source: require("@assets/images/particle1.png"),
      style: {
        width: 66,
        height: 34,
        marginLeft: -66 / 2,
        marginTop: -34 / 2,
      },
      angle: 70,
    },
    {
      source: require("@assets/images/particle2.png"),
      style: {
        width: 52,
        height: 49,
        marginLeft: -52 / 2,
        marginTop: -49 / 2,
      },
      angle: 90,
    },
    {
      source: require("@assets/images/particle1.png"),
      style: {
        width: 66,
        height: 34,
        marginLeft: -66 / 2,
        marginTop: -34 / 2,
      },
      angle: 110,
    },
    {
      source: require("@assets/images/particle2.png"),
      style: {
        width: 52,
        height: 49,
        marginLeft: -52 / 2,
        marginTop: -49 / 2,
      },
      angle: 130,
    },
    {
      source: require("@assets/images/particle1.png"),
      style: {
        width: 52,
        height: 49,
        marginLeft: -52 / 2,
        marginTop: -49 / 2,
      },
      angle: 150,
    },
  ];

  const showModal = useCallback((options: ModalOptions) => {
    setModalContent(options);
    setErrorContent(null);
    setVisible(true);
  }, []);

  const showErrorModal = useCallback(
    (message: string, type: "announcement" | "error") => {
      if (visible) {
        setQueuedError({ message, type });
        setVisible(false); // 먼저 닫기
      } else {
        setErrorContent({ message, type });
        setModalContent(null);
        setVisible(true);
      }
    },
    [visible]
  );
  const hideModal = useCallback(() => {
    setVisible(false);
    setModalContent(null);
    setErrorContent(null);
  }, []);

  const renderErrorModal = () => (
    <View className="bg-white w-[300px] md:w-[468px] rounded-2xl p-5">
      <View className="flex flex-row items-center gap-x-2 mb-4">
        <ErrorFace />
        <Text size="lg" weight="semibold" textColor="black">
          {errorContent?.type === "error" ? "오류가 발생했어요." : "안내"}
        </Text>
      </View>
      <Text className="text-center mb-4" weight="medium" textColor="black">
        {errorContent?.message}
      </Text>
      <Button
        variant="primary"
        onPress={hideModal}
        className="w-full rounded-md"
      >
        네, 확인했어요
      </Button>
    </View>
  );

  const renderCustomModal = () => {
    const handleButtonClick = (callback?: () => void) => {
      if (isClicked.current) return;
      isClicked.current = true;

      callback?.();
      hideModal();

      setTimeout(() => {
        isClicked.current = false;
      }, 300);
    };

    return (
      <View
        onLayout={onLayout}
        className={cn(
          "bg-white w-[300px] md:w-[468px] rounded-2xl p-5 relative",
          modalContent?.showLogo && "pt-[60px]"
        )}
      >
        {modalContent?.showParticle &&
          PARTICLE_IMAGE.map((item, index) => (
            <ModalParticle
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              angle={item.angle}
              source={item.source}
              width={size.width}
              height={size.height}
              style={item.style}
            />
          ))}

        {modalContent?.showLogo && (
          <View style={styles.logoStyle}>
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "#7A4AE2",
              }}
            >
              <Image
                source={require("@assets/images/letter.png")}
                style={{ width: 60, height: 60 }}
              />
            </View>
          </View>
        )}
        {!!modalContent?.customTitle && modalContent.customTitle}
        {!modalContent?.customTitle && modalContent?.title && (
          <View className="mb-4">
            {typeof modalContent.title === "string" ? (
              <Text size="18" weight="semibold" textColor="black">
                {modalContent.title}
              </Text>
            ) : (
              modalContent.title
            )}
          </View>
        )}
        <View className="mb-4">
          {typeof modalContent?.children === "string" ? (
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
              onPress={() =>
                handleButtonClick(modalContent.secondaryButton?.onClick)
              }
              className="flex-1"
            >
              {modalContent.secondaryButton.text}
            </Button>
          )}
          {modalContent?.primaryButton && (
            <Button
              variant="primary"
              onPress={() =>
                handleButtonClick(modalContent.primaryButton?.onClick)
              }
              className="flex-1"
            >
              {modalContent.primaryButton.text}
            </Button>
          )}
        </View>
      </View>
    );
  };
  return (
    <ModalContext.Provider value={{ showModal, showErrorModal, hideModal }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
        onDismiss={() => {
          if (queuedError) {
            setErrorContent(queuedError);
            setQueuedError(null);
            setVisible(true);
          }
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          {errorContent ? renderErrorModal() : renderCustomModal()}
        </View>
      </Modal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  logoStyle: {
    position: "absolute",
    top: -18,
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "#fff",
    padding: 5.7,
  },
});
