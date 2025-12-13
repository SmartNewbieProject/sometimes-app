import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

interface OverlayContextType {
  showOverlay: (children: ReactNode) => void;
  hideOverlay: () => void;
  visible: boolean;
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

  const handleCloseOverlay = () => {
    hideOverlay();
  };

  return (
    <OverlayContext.Provider value={{ showOverlay, hideOverlay, visible }}>
      {children}
      {visible && (
        <Pressable onPress={handleCloseOverlay} style={styles.container}>
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
const { height } = Dimensions.get("window");

export const guideHeight = 860;

interface GuideViewProps {
  children: React.ReactNode;
  paddingBottom?: number;
}

export const GuideView = ({ children, paddingBottom = 0 }: GuideViewProps) => {
  const contentContainerStyle = paddingBottom > 0 ? { paddingBottom } : undefined;

  return height > guideHeight ? (
    <View style={{ flex: 1, paddingBottom }}>{children}</View>
  ) : (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};
