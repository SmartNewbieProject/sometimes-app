import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getILiked } from "../api";

function useILikedQuery() {
  const { data, ...props } = useQuery({
    queryKey: ["liked", "of-me"],
    queryFn: getILiked,
    refetchInterval: 1 * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0,
  });
  return { data, ...props };
}

const styles = StyleSheet.create({});

export default useILikedQuery;
