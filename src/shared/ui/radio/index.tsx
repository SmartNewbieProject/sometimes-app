import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Show } from "../show";
import { TextArea } from "../text-area";

interface Option {
  label: string;
  value: string;
}
export interface RadioProps {
  value: string;
  onChange?: (value: string) => void;
  option: Option;
  className?: string;
  isOther?: boolean;
  otherReason?: string;
  onChangeOtherReason?: (text: string) => void;
}

function Radio({
  value,
  onChange,
  option,
  className,
  isOther,
  otherReason,
  onChangeOtherReason,
}: RadioProps) {
  const selected = value === option.value;
  return (
    <Pressable
      className={className}
      onPress={() => onChange?.(option.value)}
      style={[
        styles.container,
        { backgroundColor: selected ? "#E2D5FF" : "#fff" },
      ]}
    >
      <View style={styles.contentContainer}>
        <View
          style={[
            styles.radioContainer,
            { borderColor: selected ? "#7A4AE2" : "#000" },
          ]}
        >
          <Show when={selected}>
            <View style={styles.radio} />
          </Show>
        </View>
        <View>
          <Text
            style={[styles.labelText, { color: selected ? "#7A4AE2" : "#000" }]}
          >
            {option.label}
          </Text>
        </View>
      </View>

      <Show when={!!isOther && option.label === "기타"}>
        <TextArea
          value={otherReason}
          size="sm"
          className="mb-[9px]"
          onChangeText={onChangeOtherReason}
          placeholder="기타 이유를 입력해주세요"
        />
      </Show>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 13,

    minHeight: 39,
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contentContainer: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  labelText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1F2937",
  },
  radioContainer: {
    position: "relative",
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#9747FF",
  },
});

export default Radio;
