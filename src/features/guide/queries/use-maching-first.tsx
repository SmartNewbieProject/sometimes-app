import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getMatchingHasFirst } from "../apis";

function useMatchingFirst() {
  return useQuery({
    queryKey: ["matching-first"],
    queryFn: () => getMatchingHasFirst(),
  });
}

export default useMatchingFirst;
