import { tryCatch } from "@/src/shared/libs";
import { env } from "@/src/shared/libs/env";
import { shareFeedTemplate } from "@react-native-kakao/share";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import useReferralCode from "./use-referral-code";
import { useToast } from "@/src/shared/hooks/use-toast";
import CopyIcon from "@assets/icons/toast/copy.svg";
import { useTranslation } from "react-i18next";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    Kakao?: any;
  }
}


const LINK = env.LINK;

function useShare() {
  const { t } = useTranslation();
  const { referralCode } = useReferralCode();
  const { emitToast } = useToast();

  const handleShareCode = async () => {
     try {
       if (referralCode) {
        await Clipboard.setStringAsync(referralCode);
        emitToast(t("features.event.hooks.use_share.code_copied"), <CopyIcon />)

       } else {
         throw new Error(t("features.event.hooks.use_share.loading_code"))
      }

    } catch (error: any) {
       console.error(error);
       emitToast(error?.message ?? t("features.event.hooks.use_share.code_copy_failed"))
    }
  }
  

  const handleShareLink = async () => {
    try {
      if (referralCode) {
        await Clipboard.setStringAsync(`${LINK}?invite-code=${referralCode}`);
      } else {
        throw new Error(t("features.event.hooks.use_share.loading_code"))
      }
      emitToast(t("features.event.hooks.use_share.link_copied"), <CopyIcon />)
    } catch (error:any) {
      console.error(error);
         emitToast(error?.message ?? t("features.event.hooks.use_share.link_copy_failed"))
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
