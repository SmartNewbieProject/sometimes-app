import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

export default function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number } }) => {
      setWindowWidth(window.width);
    };

    const subscription = Dimensions.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return windowWidth;
}
