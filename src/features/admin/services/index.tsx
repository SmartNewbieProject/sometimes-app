import { router } from "expo-router";
import { useAuth } from "../../auth";

export const excludeEmails = [
  'billing-test@gmail.com',
  '20211072@edu.hanbat.ac.kr',
  'kwysome@gmail.com',
  'leeji3301@naver.com',
  'yangdl38@naver.com',
  'deveungi@gmail.com',
];

export const loginProduction = (email: string) => {
  if (excludeEmails.includes(email)) {
    router.navigate('/home');
    return;
  }
  router.navigate('/commingsoon');
};

export const doAdmin = (callback:() => void, noAdminCallback?:() => void) => {
  const { my } = useAuth();
  if (my?.email && excludeEmails.includes(my.email)) {
    callback();
  } else {
    noAdminCallback?.();
  }
}