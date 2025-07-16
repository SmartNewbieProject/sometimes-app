import { storage } from "@/src/shared/libs/store";
import { usePathname, useSegments } from "expo-router";
import React, { type ReactNode, useEffect } from "react";
import { Text } from "../ui";

interface RouteTrackerProps {
  children: ReactNode;
}

export function RouteTracker({ children }: RouteTrackerProps) {
  const pathname = usePathname();
  const segments = useSegments();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const saveCurrentPath = async () => {
      try {
        const current = await storage.getItem("current-path");
        await storage.setItem("previous-path", current ?? "/");
        await storage.setItem("current-path", pathname);
      } catch (error) {
        console.error("Failed to save current path:", error);
      }
    };

    saveCurrentPath();
  }, [pathname, segments]);

  console.log(!React.isValidElement(children));
  if (typeof children === "string" || typeof children === "number") {
    return <Text>{children}</Text>;
  }

  if (!React.isValidElement(children)) {
    return <Text>{String(children)}</Text>;
  }

  return children;
}
