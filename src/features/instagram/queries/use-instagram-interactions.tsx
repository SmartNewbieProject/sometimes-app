import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { postInteractionInstagram } from "../apis";

function useInstagramInteractions(connectionId: string) {
  return useQuery({
    queryKey: ["instragram-interaction", connectionId],
    queryFn: () => postInteractionInstagram(connectionId),
    enabled: !!connectionId,
  });
}

const styles = StyleSheet.create({});

export default useInstagramInteractions;
