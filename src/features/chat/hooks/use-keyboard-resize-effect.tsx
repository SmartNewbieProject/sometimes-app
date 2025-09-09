import { useEffect } from "react";

const useKeyboardResizeEffect = () => {
  useEffect(() => {
    if (!window.visualViewport) return;

    const visualViewport = window.visualViewport;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const isInputElement = (el: any) => {
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el.isContentEditable
      );
    };

    const handleResize = () => {
      const activeElement = document.activeElement;
      if (!activeElement || !isInputElement(activeElement)) return;

      const windowHeight = window.innerHeight;
      const viewportHeight = visualViewport.height;
      const keyboardHeight = windowHeight - viewportHeight;

      if (keyboardHeight > 100) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    };

    visualViewport.addEventListener("resize", handleResize);

    return () => {
      visualViewport.removeEventListener("resize", handleResize);
    };
  }, []);
};

export default useKeyboardResizeEffect;
