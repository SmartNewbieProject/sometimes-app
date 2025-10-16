import { tryCatch } from "@/src/shared/libs";
import { shareFeedTemplate } from "@react-native-kakao/share";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import useReferralCode from "./use-referral-code";
import { useToast } from "@/src/shared/hooks/use-toast";
import CopyIcon from "@assets/icons/toast/copy.svg"
declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Kakao?: any;
  }
}


const LINK = process.env.EXPO_PUBLIC_LINK

function useShare() {

  const { referralCode } = useReferralCode();
  const { emitToast } = useToast();

  const handleShareCode = async () => {
     try {
       if (referralCode) {
        await Clipboard.setStringAsync(referralCode);
        emitToast("초대 코드를 복사했어요", <CopyIcon />)

       } else {
         throw new Error("초대코드를 불러오는 중이에요")
      }
     
    } catch (error: any) {
       console.error(error);
       emitToast(error ?? "초대 코드 복사 실패")
    } 
  }
  

  const handleShareLink = async () => {
    try {
      if (referralCode) {
        await Clipboard.setStringAsync(`${LINK}?invite-code=${referralCode}`);
      } else {
        throw new Error("초대코드를 불러오는 중이에요")
      }
      emitToast("링크를 복사했어요", <CopyIcon />)
    } catch (error:any) {
      console.error(error);
         emitToast(error ?? "링크 복사 실패")
    } 
  };


  return {
    handleShareCode,
    handleShareLink,
    referralCode
  };
}

const styles = StyleSheet.create({});

export default useShare;
