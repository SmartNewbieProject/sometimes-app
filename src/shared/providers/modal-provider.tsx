import ModalParticle from "@/src/widgets/particle/modal-particle";
import ErrorFace from "@assets/icons/error-face.svg";
import Letter from "@assets/icons/letter.svg";
import { Image } from "expo-image";
import type React from "react";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type LayoutChangeEvent, Modal, StyleSheet, View } from "react-native";
import useCurrentModal from "../hooks/use-current-modal";
import useNestedModal from "../hooks/use-nested-modal";
import { cn } from "../libs";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
export type ModalOptions = {
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
  reverse?: boolean;
};

export type ErrorModalOptions = {
  message: string;
  type: "announcement" | "error";
};

type ModalContextType = {
  showModal: (options: ModalOptions) => void;
  showErrorModal: (message: string, type: "announcement" | "error") => void;
  hideModal: () => void;
  showNestedModal: (options: ModalOptions) => void;
  showNestedErrorModal: (
    message: string,
    type: "announcement" | "error"
  ) => void;
  hideNestedModal: () => void;
};

export type ModalOption = ModalOptions | ErrorModalOptions;

export type ModalOptionOrNull = null | ModalOptions | ErrorModalOptions;

export const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const isClicked = useRef(false);
  const { showModal, hideModal, showErrorModal, currentModal } =
    useCurrentModal();
  const {
    showNestedErrorModal,
    showNestedModal,
    hideNestedModal,
    nestedModal,
  } = useNestedModal();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({
      width: width,
      height: height,
    });
  };

  const renderErrorModal = (
    options: ErrorModalOptions,
    type: "mono" | "nested"
  ) => (
    <View className="bg-white w-[300px] md:w-[468px] rounded-2xl p-5">
      <View className="flex flex-row items-center gap-x-2 mb-4">
        <ErrorFace />
        <Text size="lg" weight="semibold" textColor="black">
          {options.type === "error" ? "오류가 발생했어요." : "안내"}
        </Text>
      </View>
      <Text className="text-center mb-4" weight="medium" textColor="black">
        {options.message}
      </Text>
      <Button
        variant="primary"
        onPress={type === "mono" ? hideModal : hideNestedModal}
        className="w-full rounded-md"
      >
        네, 확인했어요
      </Button>
    </View>
  );

  const renderCustomModal = (
    options: ModalOptions,
    type: "mono" | "nested"
  ) => {
    const handleButtonClick = (callback?: () => void) => {
      if (isClicked.current) return;
      isClicked.current = true;

      callback?.();
      if (type === "mono") {
        hideModal();
      } else {
        hideNestedModal();
      }

      setTimeout(() => {
        isClicked.current = false;
      }, 300);
    };

    return (
      <View
        onLayout={onLayout}
        className={cn(
          "bg-white w-[300px] md:w-[468px] rounded-2xl p-5 relative",
          options?.showLogo && "pt-[60px]"
        )}
      >
        {options?.showParticle &&
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

        {options?.showLogo && (
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
        {!!options?.customTitle && options.customTitle}
        {!options?.customTitle && options?.title && (
          <View className="mb-4">
            {typeof options.title === "string" ? (
              <Text size="18" weight="semibold" textColor="black">
                {options.title}
              </Text>
            ) : (
              options.title
            )}
          </View>
        )}
        <View className="mb-4">
          {typeof options?.children === "string" ? (
            <Text className="text-center" weight="medium" textColor="black">
              {options.children}
            </Text>
          ) : (
            options?.children
          )}
        </View>
        <View
          style={{
            flexDirection: options?.reverse ? "row-reverse" : "row",
          }}
          className="flex flex-row gap-x-2"
        >
          {options?.secondaryButton && (
            <Button
              variant="secondary"
              onPress={() =>
                handleButtonClick(options.secondaryButton?.onClick)
              }
              className="flex-1"
            >
              {options.secondaryButton.text}
            </Button>
          )}
          {options?.primaryButton && (
            <Button
              variant="primary"
              onPress={() => handleButtonClick(options.primaryButton?.onClick)}
              className="flex-1"
            >
              {options.primaryButton.text}
            </Button>
          )}
        </View>
      </View>
    );
  };
  return (
    <ModalContext.Provider
      value={{
        showModal,
        showErrorModal,
        hideModal,
        showNestedErrorModal,
        showNestedModal,
        hideNestedModal,
      }}
    >
      {children}
      <Modal
        visible={!!currentModal}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
        onDismiss={() => {}}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          {currentModal && "type" in currentModal
            ? renderErrorModal(currentModal as ErrorModalOptions, "mono")
            : currentModal
            ? renderCustomModal(currentModal as ModalOptions, "mono")
            : null}
        </View>
      </Modal>
      <Modal
        visible={!!nestedModal}
        transparent
        animationType="fade"
        onRequestClose={hideNestedModal}
        onDismiss={() => {}}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          {nestedModal && "type" in nestedModal
            ? renderErrorModal(nestedModal as ErrorModalOptions, "nested")
            : nestedModal
            ? renderCustomModal(nestedModal as ModalOptions, "nested")
            : null}
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
