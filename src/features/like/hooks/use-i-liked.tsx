import React from "react";
import { StyleSheet, View } from "react-native";
import useILikedQuery from "../queries/use-i-liked-query";

function useILiked() {
  const { data, isLoading } = useILikedQuery();

  const isLikedPartner = (connectionId: string) => {
    if (isLoading) {
      return false;
    }
    return !!data?.find((matching) => matching.connectionId === connectionId);
  };

  return {
    isLikedPartner,
  };
}

export default useILiked;
