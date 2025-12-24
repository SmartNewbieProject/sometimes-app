import ModalParticle from "@/src/widgets/particle/modal-particle";
import { semanticColors } from '../constants/semantic-colors';
import ErrorFace from "@assets/icons/error-face.svg";
import Letter from "@assets/icons/letter.svg";
import CloseIcon from "@assets/icons/close.svg";
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
import { type LayoutChangeEvent, Modal, StyleSheet, View, useWindowDimensions, TouchableOpacity, Pressable } from "react-native";
import useCurrentModal from "../hooks/use-current-modal";
import useNestedModal from "../hooks/use-nested-modal";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

type ModalOptions = {
  title?: ReactNode;
  customTitle?: ReactNode;
  children?: ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
  };
  banner?: React.ReactNode;
  showParticle?: boolean;
  showLogo?: boolean | React.ReactNode;
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  reverse?: boolean;
  custom?: React.ElementType;
  buttonLayout?: 'horizontal' | 'vertical';
  dismissable?: boolean;
};

export type ErrorModalOptions = {
  message: string;
  type: "announcement" | "error";
  dismissable?: boolean;
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
  const { showModal, hideModal, showErrorModal, currentModal } =
    useCurrentModal();
  const {
    showNestedErrorModal,
    showNestedModal,
    hideNestedModal,
    nestedModal,
  } = useNestedModal();
  const { width: windowWidth } = useWindowDimensions();
  const modalWidth = windowWidth >= 768 ? 468 : 300;

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
  ) => {
    const dismissable = options.dismissable ?? true;
    const handleClose = type === "mono" ? hideModal : hideNestedModal;

    return (
      <View style={[styles.errorModalContainer, { width: modalWidth }]}>
        {dismissable && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.closeIconContainer}>
              <Text size="20" weight="medium" textColor="gray" style={{ lineHeight: 20 }}>✕</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.errorModalHeader}>
          <ErrorFace />
          <Text size="lg" weight="semibold" textColor="black">
            {options.type === "error" ? "오류가 발생했어요." : "안내"}
          </Text>
        </View>
        <Text style={styles.errorModalMessage} weight="medium" textColor="black">
          {options.message}
        </Text>
        <Button
          variant="primary"
          onPress={handleClose}
          width="full"
        >
          네, 확인했어요
        </Button>
      </View>
    );
  };

  const renderCustomModal = (
    options: ModalOptions,
    type: "mono" | "nested"
  ) => {
    const handleButtonClick = (callback?: () => void) => {
      callback?.();
      if (type === "mono") {
        hideModal();
      } else {
        hideNestedModal();
      }
    };
    const handleClose = type === "mono" ? hideModal : hideNestedModal;
    const dismissable = options.dismissable ?? true;

    const Custom = options?.custom;
    if (Custom) {
      return <Custom />;
    }

    return (
      <View
        onLayout={onLayout}
        style={[
          styles.customModalContainer,
          { width: modalWidth },
          options?.showLogo && styles.customModalWithLogo
        ]}
      >
        {dismissable && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.closeIconContainer}>
              <Text size="20" weight="medium" textColor="gray" style={{ lineHeight: 20 }}>✕</Text>
            </View>
          </TouchableOpacity>
        )}
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
            <View style={styles.logoBackground}>
              {typeof options.showLogo === "boolean" ? (
                <Image
                  source={require("@assets/images/letter.png")}
                  style={styles.logoImage}
                />
              ) : (
                options.showLogo
              )}
            </View>
          </View>
        )}
        {!!options?.banner && options?.banner}
        {!!options?.customTitle && options.customTitle}
        {!options?.customTitle && options?.title && (
          <View style={styles.titleContainer}>
            {typeof options.title === "string" ? (
              <Text size="18" weight="semibold" textColor="black">
                {options.title}
              </Text>
            ) : (
              options.title
            )}
          </View>
        )}
        <View style={styles.childrenContainer}>
          {typeof options?.children === "string" ? (
            <Text style={styles.centeredText} weight="medium" textColor="black">
              {options.children}
            </Text>
          ) : (
            options?.children
          )}
        </View>
        <View
          style={[
            styles.buttonContainer,
            {
              flexDirection:
                options?.buttonLayout === 'vertical'
                  ? "column"
                  : options?.buttonLayout === 'horizontal'
                  ? "row"
                  : // 기본: 텍스트 길이로 자동 판단
                  (options?.primaryButton?.text.length ?? 0) >= 6 ||
                  (options?.secondaryButton?.text.length ?? 0) >= 6
                  ? "column"
                  : options?.reverse ? "row-reverse" : "row",
            }
          ]}
        >
          {/* 수직 정렬일 때는 primary 먼저, 수평 정렬일 때는 secondary 먼저 */}
          {(options?.buttonLayout === 'vertical' ||
            ((options?.primaryButton?.text.length ?? 0) >= 6 ||
            (options?.secondaryButton?.text.length ?? 0) >= 6)) ? (
            <>
              {options?.primaryButton && (
                <Button
                  variant="primary"
                  onPress={() => handleButtonClick(options.primaryButton?.onClick)}
                  width="full"
                  styles={styles.buttonColumn}
                >
                  {options.primaryButton.text}
                </Button>
              )}
              {options?.secondaryButton && (
                <Button
                  variant="secondary"
                  onPress={() =>
                    handleButtonClick(options.secondaryButton?.onClick)
                  }
                  width="full"
                  styles={styles.buttonColumn}
                >
                  {options.secondaryButton.text}
                </Button>
              )}
            </>
          ) : (
            <>
              {options?.secondaryButton && (
                <Button
                  variant="secondary"
                  onPress={() =>
                    handleButtonClick(options.secondaryButton?.onClick)
                  }
                  styles={styles.button}
                >
                  {options.secondaryButton.text}
                </Button>
              )}
              {options?.primaryButton && (
                <Button
                  variant="primary"
                  onPress={() => handleButtonClick(options.primaryButton?.onClick)}
                  styles={styles.button}
                >
                  {options.primaryButton.text}
                </Button>
              )}
            </>
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
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={(e) => {
            if (e.target === e.currentTarget) {
              const isDismissable = currentModal && "type" in currentModal
                ? (currentModal as ErrorModalOptions).dismissable ?? true
                : (currentModal as ModalOptions).dismissable ?? true;
              if (isDismissable) {
                hideModal();
              }
            }
          }}
        >
          <View onStartShouldSetResponder={() => true}>
            {currentModal && "type" in currentModal
              ? renderErrorModal(currentModal as ErrorModalOptions, "mono")
              : currentModal
              ? renderCustomModal(currentModal as ModalOptions, "mono")
              : null}
          </View>
        </Pressable>

        {nestedModal && (
          <Pressable
            style={[StyleSheet.absoluteFill, styles.nestedModalOverlay]}
            onPress={(e) => {
              if (e.target === e.currentTarget) {
                const isDismissable = nestedModal && "type" in nestedModal
                  ? (nestedModal as ErrorModalOptions).dismissable ?? true
                  : (nestedModal as ModalOptions).dismissable ?? true;
                if (isDismissable) {
                  hideNestedModal();
                }
              }
            }}
          >
            <View onStartShouldSetResponder={() => true}>
              {nestedModal && "type" in nestedModal
                ? renderErrorModal(nestedModal as ErrorModalOptions, "nested")
                : renderCustomModal(nestedModal as ModalOptions, "nested")}
            </View>
          </Pressable>
        )}
      </Modal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  // Error Modal Styles
  errorModalContainer: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  errorModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorModalMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },

  // Close Button
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  closeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: semanticColors.surface.tertiary || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Custom Modal Styles
  customModalContainer: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  customModalWithLogo: {
    paddingTop: 60,
  },
  logoStyle: {
    position: "absolute",
    top: -18,
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: semanticColors.surface.background,
    padding: 5.7,
  },
  logoBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: semanticColors.brand.primary,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  titleContainer: {
    marginBottom: 16,
  },
  childrenContainer: {
    marginBottom: 16,
  },
  centeredText: {
    textAlign: 'center',
  },

  // Button Container Styles
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  button: {
    flex: 1, // 가로 배치일 때 1:1 비율
  },
  buttonColumn: {
    width: '100%', // 세로 배치일 때 전체 너비
  },

  // Modal Overlay Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nestedModalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
