import { useModal } from "@/src/shared/hooks/use-modal";
import Slider from "@/src/widgets/slide";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

function Test() {
  const { showModal } = useModal();

  useEffect(() => {
    showModal({
      showLogo: true,
      title: "인증번호가 메일로 전송됐어요",
      children: "메일을 확인해 주세요",
    });
  }, []);
}

const styles = StyleSheet.create({});

export default Test;
