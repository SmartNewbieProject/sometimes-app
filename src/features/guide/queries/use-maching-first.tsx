import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getMatchingHasFirst } from "../apis";

function useMatchingFirst() {
  return useQuery({
    queryKey: ["matching-first"],
    queryFn: () => getMatchingHasFirst(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export default useMatchingFirst;
