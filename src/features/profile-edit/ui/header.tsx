import { useModal } from "@/src/shared/hooks/use-modal";
import { semanticColors } from '../../../shared/constants/colors';
import { Header } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMyInfoForm } from "../../my-info/hooks";

function ProfileEditHeader() {
  const router = useRouter();
  const { clear } = useMyInfoForm();
  const { showModal } = useModal();

  return (
    <Header.Container className="items-center  ">
      <Header.LeftContent>
        <Pressable
          onPress={() => {
            showModal({
              title: "수정 중인 내용이 있어요",
              children:
                "지금 나가면 작성 중인 \n수정 내용이 모두 사라져요.\n정말 나가시겠어요?",
              primaryButton: {
                text: "계속 수정하기",
                onClick: () => {
                  return;
                },
              },
              secondaryButton: {
                text: "나가기",
                onClick: () => {
                  router.navigate("/my");
                  clear();
                },
              },
            });
          }}
          style={styles.arrowContainer}
        >
          <View style={styles.backArrow} />
        </Pressable>
      </Header.LeftContent>
      <Header.CenterContent>
        <Text style={styles.headerTitle}>프로필 수정</Text>
      </Header.CenterContent>

      <Header.RightContent>
        <View />
      </Header.RightContent>
    </Header.Container>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: semanticColors.text.primary,
    fontSize: 20,
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    lineHeight: 22,
  },
  backArrow: {
    width: 12.6,
    height: 12.6,
    top: 3,
    left: 3,
    position: "absolute",
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    borderTopWidth: 2,
    borderTopColor: "#000",
    transform: [{ rotate: "-45deg" }],
    borderRadius: 2,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});

export default ProfileEditHeader;
