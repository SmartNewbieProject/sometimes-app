import Feather from "@expo/vector-icons/Feather";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
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
import { useTranslation } from "react-i18next";

import { useReport } from "@/src/features/ban-report/hooks/useReport";
import useLeaveChatRoom from "@/src/features/chat/queries/use-leave-chat-room";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Header } from "@shared/ui";

const { width } = Dimensions.get("window");

export default function ReportScreen() {
  const { t } = useTranslation();
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
    name: t("apps.partner.profile_unknown_name"),
    age: 0,
    university: t("apps.partner.profile_unknown_univ"),
    profileImage: "https://placehold.co/100x100/CCCCCC/999999?text=NO+IMG", // 기본 이미지
  });

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [detailedContent, setDetailedContent] = useState("");
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<any[]>([]);
  const isSubmitButtonEnabled = selectedReasons.length > 0 && !isLoading;

  const chatLeaveMutate = useLeaveChatRoom();

  const reportReasons = [
    {
      id: "1",
      text: t("apps.partner.reason_1_text"),
      subText: t("apps.partner.reason_1_sub"),
    },
    {
      id: "2",
      text: t("apps.partner.reason_2_text"),
      subText: t("apps.partner.reason_2_sub"),
    },
    {
      id: "3",
      text: t("apps.partner.reason_3_text"),
      subText: t("apps.partner.reason_3_sub"),
    },
    {
      id: "4",
      text: t("apps.partner.reason_4_text"),
      subText: t("apps.partner.reason_4_sub"),
    },
    {
      id: "5",
      text: t("apps.partner.reason_5_text"),
      subText: t("apps.partner.reason_5_sub"),
    },
    {
      id: "6",
      text: t("apps.partner.reason_6_text"),
      subText: t("apps.partner.reason_6_sub"),
    },
  ];

  const handleReasonSelect = (id: string) => {
    setSelectedReasons((prev) => (prev.includes(id) ? [] : [id]));
  };

  const handleSubmitReport = () => {
    if (!partnerId) {
      showModal({
        title: t("apps.partner.modal_image_error_title"),
        children: t("apps.partner.modal_error_desc"),
        primaryButton: {
          text: t("confirm"),
          onClick: () => hideModal(),
        },
      });
      return;
    }

    const isOtherReasonSelected = selectedReasons.includes("6");
    if (isOtherReasonSelected && detailedContent.trim() === "") {
      showModal({
        title: t("apps.partner.modal_required_title"),
        children: t("apps.partner.modal_required_desc"),
        primaryButton: {
          text: t("confirm"),
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
        title: t("apps.partner.modal_permission_title"),
        children: t("apps.partner.modal_permission_desc"),
        primaryButton: {
          text: t("confirm"),
          onClick: () => hideModal(),
        },
      });
      return;
    }

    try {
      const remainingSelectionLimit = 3 - selectedImageUris.length;
      if (remainingSelectionLimit <= 0) {
        showModal({
          title: t("apps.partner.modal_alert_title"),
          children: t("apps.partner.modal_alert_desc_max"),
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
              title: t("apps.partner.modal_alert_title"),
              children: t("apps.partner.modal_alert_desc_type", {
                type: asset.mimeType,
              }),
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
        title: t("apps.partner.modal_image_error_title"),
        children: t("apps.partner.modal_image_error_desc"),
        primaryButton: {
          text: t("confirm"),
          onClick: () => hideModal(),
        },
      });
    }
  };

  useEffect(() => {
    showModal({
      title: t("apps.partner.modal_notice_title"),
      children: t("apps.partner.modal_notice_desc"),
      primaryButton: {
        text: t("apps.partner.modal_notice_confirm"),
        onClick: () => hideModal(),
      },
    });
    if (partnerId) {
      setProfile({
        name: partnerName || t("apps.partner.profile_unknown_name"),
        age: partnerAge ? Number.parseInt(partnerAge, 10) : 0,
        university: partnerUniv || t("apps.partner.profile_unknown_univ"),
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
          disabled={isLoading}
        >
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image
            source={require("@/assets/icons/emergency.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitleText}>{t("apps.partner.header_title")}</Text>
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
            <Text style={styles.profileAge}>
                {t("apps.partner.profile_age", { age: profile.age })}
              </Text>
            <Text style={styles.profileUniversity}>{profile.university}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("apps.partner.reason_select_title")}</Text>
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
                disabled={isLoading}
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
          <Text style={styles.sectionTitle}>{t("apps.partner.detail_title")}</Text>
          <TextInput
            style={styles.detailedInput}
            placeholder={t("apps.partner.detail_placeholder")}
            multiline
            value={detailedContent}
            onChangeText={setDetailedContent}
            placeholderTextColor="#9CA3AF"
            editable={!isLoading}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("apps.partner.evidence_title")}</Text>
          <View style={styles.evidenceContainer}>
            {selectedImageUris.length === 0 ? (
              <TouchableOpacity
                style={styles.attachEvidenceButtonPlaceholder}
                onPress={handleAttachEvidence}
                disabled={isLoading}
              >
                <Feather name="camera" size={24} color="#9CA3AF" />
                <Text style={styles.attachEvidenceText}>
                  {t("apps.partner.evidence_attach_text")}
                </Text>
                <Text style={styles.attachFileButton}>{t("apps.partner.evidence_attach_file")}</Text>
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
            <Text style={styles.infoText}>{t("apps.partner.info_1")}</Text>
            <Text style={styles.infoText}>{t("apps.partner.info_2")}</Text>
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
            <Text style={styles.submitButtonText}>{t("apps.partner.button_submit")}</Text>
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

