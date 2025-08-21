import { axiosClient } from "@/src/shared/libs";

interface ReportPayload {
  userId: string;
  reason: string;
  description?: string;
  evidenceImages?: { uri: string; name: string; type: string }[];
}

export interface ReportResponse {
  id: string;
  reportUserId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
  evidenceImages: string[];
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

/**
 * @param payload 신고에 필요한 데이터 (userId, reason, description, evidenceImages)
 * @returns 서버 응답 데이터
 */
export async function submitReport(
  payload: ReportPayload
): Promise<ReportResponse> {
  const formData = new FormData();
  formData.append("reason", payload.reason);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  // evidenceImages가 존재하면 FormData에 추가
  if (payload.evidenceImages && payload.evidenceImages.length > 0) {
    for (const file of payload.evidenceImages) {
      try {
        // 이미지 URI로부터 Blob 객체 생성
        const response = await fetch(file.uri);
        const blob = await response.blob();

        formData.append("evidenceImages", blob, file.name);
      } catch (error) {
        console.error(
          `Error converting image URI to Blob for ${file.name}:`,
          error
        );
      }
    }
  }

  try {
    const { data } = await axiosClient.post<ReportResponse>(
      `/users/${payload.userId}/reports`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          // Bearer Token은 axiosClient 인터셉터에서 추가.
        },
      }
    );
    return data;
  } catch (error) {
    console.error("신고 제출 실패:", error);
    throw error;
  }
}
