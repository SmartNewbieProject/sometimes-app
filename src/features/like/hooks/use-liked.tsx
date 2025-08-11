import React from "react";
import { StyleSheet, View } from "react-native";
import useILikedQuery from "../queries/use-i-liked-query";
import useLikedMeQuery from "../queries/use-liked-me-query";

function useLiked() {
  const { data: iLiked, isLoading: isILoading } = useILikedQuery();
  const { data: likedMe, isLoading: isMeLoading } = useLikedMeQuery();
  const isLikedPartner = (connectionId: string) => {
    if (isILoading) {
      return false;
    }
    return !!iLiked?.find((matching) => matching.connectionId === connectionId);
  };

  const showCollapse = () => {
    if (isILoading || isMeLoading) {
      return false;
    }
    if (likedMe && likedMe?.length > 0) {
      return { data: likedMe, type: "likedMe" };
    }
    if (iLiked && iLiked?.length > 0) {
      return { data: iLiked, type: "iLiked" };
    }
    return false;
  };

  const isOpen = (connectionId: string) => {
    if (isILoading) {
      return false;
    }
    console.log(
      "check",
      iLiked?.find((matching) => matching.connectionId === connectionId)?.status
    );
    return (
      iLiked?.find((matching) => matching.connectionId === connectionId)
        ?.status === "OPEN"
    );
  };

  return {
    isLikedPartner,
    showCollapse,
    isOpen,
  };
}

export default useLiked;
