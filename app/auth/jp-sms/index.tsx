/**
 * JP SMS 인증 페이지
 * 한국 회원가입 레이아웃과 동일한 구조
 */

import { router } from 'expo-router';
import { JpSmsAuthContainer } from '@/src/features/jp-auth';

export default function JpSmsAuthPage() {
  const handleCancel = () => {
    router.back();
  };

  return <JpSmsAuthContainer onCancel={handleCancel} />;
}
