import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function MomentReportRoute() {
  const router = useRouter();

  useEffect(() => {
    // 올바른 weekly-report 경로로 리다이렉션
    router.replace("/moment/weekly-report");
  }, [router]);

  return null;
}
