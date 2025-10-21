import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useStep } from "../../hooks/use-step";
import HomeGuide from "./home";
import LikeGuide from "./like";

interface LikeGuideScenarioProps {
  visible: boolean;
  hideModal: () => void;
}

function LikeGuideScenario({ visible, hideModal }: LikeGuideScenarioProps) {
  const { step } = useStep();
  return (
    <Modal visible={visible} transparent onRequestClose={hideModal}>
      {step < 3 && <HomeGuide />}
      {step > 2 && <LikeGuide />}
    </Modal>
  );
}

const styles = StyleSheet.create({});

export default LikeGuideScenario;
