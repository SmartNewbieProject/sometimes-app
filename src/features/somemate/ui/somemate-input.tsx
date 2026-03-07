import SendChatIcon from "@assets/icons/send-chat.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type React from "react";
import { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface SomemateInputProps {
  onSend?: (message: string) => void;
}

export function SomemateInput({ onSend }: SomemateInputProps) {
  const { t } = useTranslation();
  const [chat, setChat] = useState("");
  const insets = useSafeAreaInsets();

  const handleSend = useCallback(async () => {
    if (chat === "") {
      return;
    }

    const messageContent = chat.trim();
    setChat("");

    if (onSend) {
      onSend(messageContent);
    }
  }, [chat, onSend]);

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          value={chat}
          editable={true}
          onChangeText={(text) => setChat(text)}
          style={styles.textInput}
          placeholder={t('features.somemate.chat.input_placeholder')}
          placeholderTextColor={semanticColors.text.disabled}
        />
        {chat !== "" ? (
          <Pressable onPress={handleSend} style={styles.send}>
            <SendChatIcon width={32} height={32} />
          </Pressable>
        ) : (
          <View style={{ width: 32, height: 32 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    alignSelf: "center",
    fontSize: 16,
    lineHeight: 18,
    marginVertical: 14,
    letterSpacing: -0.042,
    paddingHorizontal: 10,
    ...(Platform.OS === "android"
      ? { textAlignVertical: "center" }
      : { paddingVertical: 0 }),
    color: semanticColors.text.secondary,
  },
  inputContainer: {
    flex: 1,
    minHeight: 47,
    maxHeight: 108,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: semanticColors.surface.surface,
    paddingHorizontal: 8,
  },
  container: {
    minHeight: 70,
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  send: {
    width: 32,
    marginVertical: 12,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    alignSelf: "flex-end",
    textAlignVertical: "top",
    backgroundColor: semanticColors.brand.primary,
  },
});

