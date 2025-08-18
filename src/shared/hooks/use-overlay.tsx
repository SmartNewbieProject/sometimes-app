import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";

interface OverlayContextType {
  showOverlay: (children: ReactNode) => void;
  hideOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextType | null>(null);

export const useOverlay = () => {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return ctx;
};

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [overlayChildren, setOverlayChildren] = useState<ReactNode>(null);

  const animation = useRef(new Animated.Value(0)).current;

  const showOverlay = useCallback(
    (content: ReactNode) => {
      setOverlayChildren(content);
      setVisible(true);

      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    },
    [animation]
  );

  const hideOverlay = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setOverlayChildren(null);
    });
  }, [animation]);

  const backgroundOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.6)"],
  });

  return (
    <OverlayContext.Provider value={{ showOverlay, hideOverlay }}>
      {children}
      {visible && (
        <Pressable onPress={hideOverlay} style={styles.container}>
          <Animated.View
            style={[styles.container, { backgroundColor: backgroundOpacity }]}
          >
            {overlayChildren}
          </Animated.View>
        </Pressable>
      )}
    </OverlayContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 999,
  },
});
