import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getILiked, getLIkedMe } from "../api";

function useLikedMeQuery() {
  const { data, ...props } = useQuery({
    queryKey: ["liked", "to-me"],
    queryFn: getLIkedMe,
    refetchInterval: 1 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
  });
  return { data, ...props };
}

const styles = StyleSheet.create({});

export default useLikedMeQuery;
