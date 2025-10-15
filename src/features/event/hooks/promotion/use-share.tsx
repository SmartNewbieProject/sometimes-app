import { tryCatch } from "@/src/shared/libs";
import { shareFeedTemplate } from "@react-native-kakao/share";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Kakao?: any;
  }
}


const LINK = "http://localhost:3000"

function useShare() {

  // 추후 백엔드 연결해서 바꿔야함 이것도 분리해야하나
  const code = "SOME24A1"

  const handleShareCode = async () => {
     try {
      
       await Clipboard.setStringAsync(code);
       // TODO 토스트 필요
    } catch (error) {
      console.error(error);
      // TODO 토스트 필요
    } finally {
      
    }
  }
  

  const handleShareLink = async () => {
    try {
      
      await Clipboard.setStringAsync(LINK);
    } catch (error) {
      console.error(error);
      // TODO 토스트 필요
    } finally {
     
    }
  };


  return {
handleShareCode,
    handleShareLink,
    
  };
}

const styles = StyleSheet.create({});

export default useShare;
