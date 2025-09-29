import { ErrorHandlingProvider } from "@SmartNewbieProject/sometime-error";
import { useRouter } from "expo-router";
import type React from "react";
import { StyleSheet, View } from "react-native";
import { useModal } from "../hooks/use-modal";
import { Text } from "../ui";
import FullScreenError from "../ui/full-screen-error";

interface ErrorProviderProps {
  children: React.ReactNode;
}

function ErrorProvider({ children }: ErrorProviderProps) {
  const router = useRouter();
  const { showModal } = useModal();
  return (
    <ErrorHandlingProvider
      actions={{
        toast: (message) => {
          console.warn("toast로 대체 필요: ", message);
        },
        modal: ({ title, message, primaryClick, secondaryClick }) => {
          showModal({
            title,
            children: (
              <View className="flex flex-col gap-y-1">
                <Text textColor="black" size="md">
                  {message}
                </Text>
              </View>
            ),
            primaryButton: {
              text: "확인",
              onClick: primaryClick ?? (() => {}),
            },
          });
        },
        redirectLogin: () => {
          router.navigate("/auth/login");
        },
      }}
      FullScreen={FullScreenError}
    >
      {children}
    </ErrorHandlingProvider>
  );
}

const styles = StyleSheet.create({});

export default ErrorProvider;
