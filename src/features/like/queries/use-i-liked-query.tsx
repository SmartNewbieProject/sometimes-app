import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { getILiked } from "../api";

function useILikedQuery() {
  const { data, ...props } = useQuery({
    queryKey: ["liked", "of-me"],
    queryFn: getILiked,
  });
  return { data, ...props };
}

const styles = StyleSheet.create({});

export default useILikedQuery;
