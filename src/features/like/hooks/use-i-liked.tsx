import React from "react";
import { StyleSheet, View } from "react-native";
import useILikedQuery from "../queries/use-i-liked-query";

function useILiked() {
  const { data, isLoading } = useILikedQuery();

  const isLikedPartner = () => {
    return data;
  };

  return {
    isLikedPartner,
  };
}

export default useILiked;
