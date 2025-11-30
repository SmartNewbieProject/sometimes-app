import Feather from "@expo/vector-icons/Feather";
import { semanticColors } from '@/src/shared/constants/colors';
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useReport } from "@/src/features/ban-report/hooks/useReport";
import useLeaveChatRoom from "@/src/features/chat/queries/use-leave-chat-room";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Header } from "@shared/ui";

const { width } = Dimensions.get("window");

export default function ReportScreen() {
  const {
    partnerId,
    partnerName,
    partnerAge,
    partnerUniv,
    partnerProfileImage,
    chatRoomId,
  } = useLocalSearchParams<{
    partnerId?: string;
    partnerName?: string;
    partnerAge?: string;
    partnerUniv?: string;
    partnerProfileImage?: string;
    chatRoomId?: string;
  }>();
  const { mutate, isLoading, isError, error } = useReport();
  const { showModal, hideModal } = useModal();
  const [profile, setProfile] = useState({
    name: "알 수 없는 사용자",
    age: 0,
    university: "알 수 없음",
    profileImage: "https://placehold.co/100x100/CCCCCC/999999?text=NO+IMG", // 기본 이미지
  });

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [detailedContent, setDetailedContent] = useState("");
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<any[]>([]);
  const isSubmitButtonEnabled = selectedReasons.length > 0 && !isLoading;

  const chatLeaveMutate = useLeaveChatRoom();

  const handleReasonSelect = (id: string) => {
    setSelectedReasons((prev) => (prev.includes(id) ? [] : [id]));
  };

  const handleSubmitReport = () => {
    if (!partnerId) {
      showModal({
        title: "오류",
        children: "신고 대상을 찾을 수 없습니다.",
        primaryButton: {
          text: "확인",
          onClick: () => hideModal(),
        },
      });
      return;
    }

    const isOtherReasonSelected = selectedReasons.includes("6");
    if (isOtherReasonSelected && detailedContent.trim() === "") {
      showModal({
        title: "필수 입력",
        children: "상세 내용을 입력해주세요!",
        primaryButton: {
          text: "확인",
          onClick: () => hideModal(),
        },
      });
      return;
    }
    if (chatRoomId) {
      mutate(
        {
          userId: partnerId,
          reason: selectedReasons
            .map((id) => reportReasons.find((r) => r.id === id)?.text || "")
            .join(", "),
          description:
            detailedContent.trim() === "" ? undefined : detailedContent,
          evidenceImages: selectedImageFiles,
        },
        {
          onSuccess: () => {
            if (chatRoomId) {
              chatLeaveMutate.mutateAsync(
                { chatRoomId: chatRoomId },
                {
                  onSuccess: () => {
                    router.navigate("/chat");
                  },
                }
              );
            }
          },
        }
      );
    } else {
      mutate({
        userId: partnerId,
        reason: selectedReasons
          .map((id) => reportReasons.find((r) => r.id === id)?.text || "")
          .join(", "),
        description:
          detailedContent.trim() === "" ? undefined : detailedContent,
        evidenceImages: selectedImageFiles,
      });
    }
  };

  const handleAttachEvidence = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showModal({
        title: "권한 필요",
        children: "사진을 선택하려면 미디어 라이브러리 접근 권한이 필요합니다.",
        primaryButton: {
          text: "확인",
          onClick: () => hideModal(),
        },
      });
      return;
    }

    try {
      const remainingSelectionLimit = 3 - selectedImageUris.length;
      if (remainingSelectionLimit <= 0) {
        showModal({
          title: "알림",
          children: "최대 3장의 이미지만 첨부할 수 있습니다.",
          primaryButton: {
            text: "확인",
            onClick: () => hideModal(),
          },
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSelectionLimit,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newSelectedUris: string[] = [];
        const newSelectedFiles: any[] = [];

        for (const asset of result.assets) {
          // 허용된 MIME 타입 (jpg, jpeg, png) 검사
          if (
            asset.mimeType === "image/jpeg" ||
            asset.mimeType === "image/png"
          ) {
            newSelectedUris.push(asset.uri);
            newSelectedFiles.push({
              uri: asset.uri,
              name:
                asset.fileName ||
                `image_${Date.now()}.${asset.uri.split(".").pop()}`,
              type: asset.mimeType,
            });
          } else {
            showModal({
              title: "알림",
              children: `허용되지 않는 이미지 형식입니다: ${asset.mimeType}\njpg, jpeg, png 형식만 가능합니다.`,
              primaryButton: {
                text: "확인",
                onClick: () => hideModal(),
              },
            });
          }
        }

        setSelectedImageUris([...selectedImageUris, ...newSelectedUris]);
        setSelectedImageFiles([...selectedImageFiles, ...newSelectedFiles]);
      } else {
        console.log("이미지 선택이 취소되었거나 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 선택 중 오류 발생:", error);
      showModal({
        title: "오류",
        children: "이미지 선택 중 오류가 발생했습니다.",
        primaryButton: {
          text: "확인",
          onClick: () => hideModal(), // 모달 닫기
        },
      });
    }
  };

  useEffect(() => {
    showModal({
      title: "주의",
      children: `신고하기 기능은 일시적으로\n상대방과의 매칭을 차단합니다.\n관리자 검토 후 확정 여부가 결정됩니다.`,
      primaryButton: {
        text: "이해했어요",
        onClick: () => hideModal(),
      },
    });
    if (partnerId) {
      setProfile({
        name: partnerName || "알 수 없는 사용자",
        age: partnerAge ? Number.parseInt(partnerAge, 10) : 0,
        university: partnerUniv || "알 수 없음",
        profileImage:
          partnerProfileImage ||
          "https://placehold.co/100x100/CCCCCC/999999?text=NO+IMG",
      });
    }
  }, [partnerId, partnerName, partnerAge, partnerUniv, partnerProfileImage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
          disabled={isLoading} // 로딩 중에는 뒤로가기 버튼 비활성화
        >
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image
            source={require("@/assets/icons/emergency.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitleText}>신고하기</Text>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: profile.profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileAge}>만 {profile.age}세</Text>
            <Text style={styles.profileUniversity}>{profile.university}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>신고 사유를 선택해주세요</Text>
          <View style={styles.reasonsList}>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonButton,
                  selectedReasons.includes(reason.id) &&
                    styles.reasonButtonSelected,
                ]}
                onPress={() => handleReasonSelect(reason.id)}
                disabled={isLoading} // 로딩 중에는 선택 불가
              >
                <View style={styles.radioCircle}>
                  {selectedReasons.includes(reason.id) && (
                    <View style={styles.selectedRadioDot} />
                  )}
                </View>
                <View style={styles.reasonTextContent}>
                  <Text style={styles.reasonText}>{reason.text}</Text>
                  <Text style={styles.reasonSubText}>{reason.subText}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>상세 내용 (선택사항)</Text>
          <TextInput
            style={styles.detailedInput}
            placeholder="신고 사유에 대해 자세히 설명해주세요..."
            multiline
            value={detailedContent}
            onChangeText={setDetailedContent}
            placeholderTextColor="#9CA3AF"
            editable={!isLoading} // 로딩 중에는 입력 불가
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>증거 자료 첨부 (선택사항)</Text>
          <View style={styles.evidenceContainer}>
            {selectedImageUris.length === 0 ? (
              <TouchableOpacity
                style={styles.attachEvidenceButtonPlaceholder}
                onPress={handleAttachEvidence}
                disabled={isLoading}
              >
                <Feather name="camera" size={24} color="#9CA3AF" />
                <Text style={styles.attachEvidenceText}>
                  스크린샷이나 증거 이미지를 첨부해주세요
                </Text>
                <Text style={styles.attachFileButton}>파일 선택</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedImagesPreviewContainer}>
                {selectedImageUris.map((uri, index) => (
                  <View key={index} style={styles.previewImageWrapper}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => {
                        const newUris = selectedImageUris.filter(
                          (_, i) => i !== index
                        );
                        const newFiles = selectedImageFiles.filter(
                          (_, i) => i !== index
                        );
                        setSelectedImageUris(newUris);
                        setSelectedImageFiles(newFiles);
                      }}
                      disabled={isLoading}
                    >
                      <Feather name="x-circle" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImageUris.length < 3 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleAttachEvidence}
                    disabled={isLoading}
                  >
                    <Feather name="plus" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoText}>
              신고 접수 후 검토까지 1-3일 소요됩니다.
            </Text>
            <Text style={styles.infoText}>
              허위 신고 시 계정 제재를 받을 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitButtonEnabled && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReport}
          disabled={!isSubmitButtonEnabled}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>신고 접수하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: semanticColors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E9EC",
  },
  headerBackButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: "#000",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "700",
    color: semanticColors.text.primary,
  },
  headerRightPlaceholder: {
    width: 24 + 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileAge: {
    fontSize: 18,
    fontWeight: "bold",
    color: semanticColors.text.secondary,
    marginBottom: 4,
  },
  profileUniversity: {
    fontSize: 14,
    color: "#888",
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: semanticColors.text.secondary,
    marginBottom: 15,
  },
  reasonsList: {
    gap: 10,
  },
  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 62,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
    paddingLeft: 16,
    paddingRight: 10,
  },
  reasonButtonSelected: {
    borderWidth: 2,
    borderColor: semanticColors.brand.secondary,
    backgroundColor: semanticColors.surface.background,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: semanticColors.border.default,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: semanticColors.brand.secondary,
  },
  reasonTextContent: {
    flex: 1,
  },
  reasonText: {
    fontSize: 16,
    color: semanticColors.text.secondary,
    fontWeight: "500",
  },
  reasonSubText: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  detailedInput: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 15,
    color: semanticColors.text.secondary,
    backgroundColor: semanticColors.surface.background,
  },
  evidenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    minHeight: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  attachEvidenceButtonPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  selectedImagesPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  previewImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  deleteImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: 24,
    height: 24,
    tintColor: "#9CA3AF",
    marginBottom: 10,
  },
  attachEvidenceText: {
    fontSize: 15,
    color: semanticColors.text.disabled,
    marginBottom: 5,
  },
  attachFileButton: {
    fontSize: 14,
    fontWeight: "600",
    color: semanticColors.brand.secondary,
    textDecorationLine: "underline",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: semanticColors.text.disabled,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  infoIconText: {
    color: semanticColors.text.inverse,
    fontSize: 14,
    fontWeight: "bold",
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: semanticColors.text.muted,
    lineHeight: 18,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: semanticColors.surface.background,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
  },
  submitButton: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    backgroundColor: semanticColors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: semanticColors.surface.other,
  },
  submitButtonText: {
    color: semanticColors.text.inverse,
    fontSize: 18,
    fontWeight: "bold",
  },
});

const reportReasons = [
  { id: "1", text: "부적절한 언어 사용", subText: "욕설, 비하 발언 등" },
  { id: "2", text: "허위 프로필", subText: "가짜 사진, 거짓 정보 등" },
  {
    id: "3",
    text: "성희롱 또는 괴롭힘",
    subText: "원치 않는 성적 메시지 등",
  },
  { id: "4", text: "스팸 또는 광고", subText: "홍보, 영리목적 메시지 등" },
  { id: "5", text: "미성년자", subText: "18세 미만으로 의심됨" },
  { id: "6", text: "기타", subText: "위에 해당하지 않는 않는 사유" },
];
