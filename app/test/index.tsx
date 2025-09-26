import { useModal } from "@/src/shared/hooks/use-modal";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

function Test() {
  const { showModal, showNestedModal } = useModal();
  useEffect(() => {
    showModal({
      title: "태스트1",
      children: "테스트1",
      primaryButton: {
        text: "확인",
        onClick: () => {},
      },
    });
    showModal({
      title: "태스트2",
      children: "테스트2",
      primaryButton: {
        text: "확인",
        onClick: () => {},
      },
    });
    showNestedModal({
      title: "태스트3",
      children: "테스트3",
      primaryButton: {
        text: "확인",
        onClick: () => {},
      },
    });
  }, []);
  return (
    <View>
      <Text>hi</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

export default Test;
