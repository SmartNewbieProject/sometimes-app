import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { tryCatch } from '@/src/shared/libs';
import { ensureAppleId, processSignup, validatePhone, validateUniversity } from '../services/signup-validator';
import { useModal } from '@/src/shared/hooks/use-modal';
import Signup from '..';
import { track } from '@/src/shared/libs/amplitude-compat';


const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  apis,
  useSignupAnalytics,
} = Signup;

function useInviteCode() {
  const router = useRouter();
  const [signupLoading, setSignupLoading] = useState(false);
  const { showErrorModal } = useModal()
    const { trackSignupEvent } = useSignupAnalytics("invite_code");

  const { updateForm, form: signupForm } = useSignupProgress();
  const { value: appleUserIdFromStorage, loading: storageLoading } = useStorage<
    string | null
  >({
    key: "appleUserId",
  });
  const { removeValue: removeAppleUserId } = useStorage({
    key: "appleUserId",
  });
  const { value: loginTypeStorage } = useStorage<string | null>({
    key: "loginType",
  });
  const { removeValue: removeLoginType } = useStorage({ key: "loginType" });

  const { value, removeValue } = useStorage({ key: "invite-code" })
  const initialValue: string | undefined = typeof value === "string" ? value : undefined

  const nextMessage = signupForm?.referralCode && signupForm.referralCode !== "" ? "다음으로" : "넘어가기"

  useEffect(() => {
    if (initialValue) {
      updateForm({ referralCode: initialValue })
    }
  }, [initialValue])

  const handleInviteCode = (code: string) => {
    updateForm({referralCode: code})
  }

  const onNext = async () => {
      setSignupLoading(true);
    
  
      await tryCatch(
        async () => {
          removeValue()

          const appleOk = await ensureAppleId(signupForm, {
            router,
            loginTypeStorage,
            appleUserIdFromStorage,
            removeAppleUserId,
            removeLoginType,
            showErrorModal,
          });
          if (!appleOk) return;
  
          const phoneOk = await validatePhone(signupForm, {
            router,
            apis,
            trackSignupEvent,
            track,
            showErrorModal,
            removeLoginType,
          });
          if (!phoneOk) return;
  
          const universityOk = validateUniversity(signupForm, {
            router,
            showErrorModal,
          });
          if (!universityOk) return;
  
          if (!signupForm.name) {
            showErrorModal("이름을 입력해주세요.", "announcement");
            return;
          }
          await processSignup(signupForm as Required<typeof signupForm>, {
            router,
            apis,
            track,
            trackSignupEvent,
            removeLoginType,
          });
        },
        (error) => {
          console.error("Signup error:", error);
          track("Signup_profile_invite_code_error", {
            error,
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });
          trackSignupEvent("signup_error", error?.message);
          showErrorModal(error?.message ?? "회원가입에 실패했습니다.", "announcement");
        }
      );
      
      setSignupLoading(false);
  };
    const onBackPress = () => {
    router.push("/auth/signup/profile-image");
    return true;
  };

   useEffect(() => {
      // 이벤트 리스너 등록
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
  
      // 컴포넌트 언마운트 시 리스너 제거
      return () => subscription.remove();
   }, []);
  
    useChangePhase(SignupSteps.INVITE_CODE);

  
  return {
    onNext, 
    signupLoading, 
    storageLoading, 
    onBackPress,
    handleInviteCode,
    code: signupForm?.referralCode ?? "",
    nextMessage
  }
}

const styles = StyleSheet.create({});

export default useInviteCode;