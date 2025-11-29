import { ImageResources } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource, Text } from "@/src/shared/ui";
import FrameIcon from "@assets/icons/frame.svg";
import ImproveProfileIcon from "@assets/icons/improve-profile.svg";
import ReloadingIcon from "@assets/icons/reloading.svg";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useRematch } from "../hooks";
import NotFoundCard from "./not-found-card";
export const NotFound = () => {
  const router = useRouter();
  const { onRematch } = useRematch();
  return (
    <View style={styles.container}>
      <ImageResource
        style={styles.image}
        resource={ImageResources.BROKEN_SANDTIMER}
        width={246}
        height={246}
      />
      <Text textColor="black" size="20" weight={"bold"}>
        매칭에 실패했어요
      </Text>

      <View style={styles.contentContainer}>
        <NotFoundCard
          title={"새로운 매칭 시도"}
          description="다른 프로필들을 둘러보세요"
          button={
            <Button
              size="chip"
              onPress={onRematch}
              style={styles.rematchButton}
            >
              재매칭
            </Button>
          }
          icon={<ReloadingIcon />}
        />
        <NotFoundCard
          iconPadding={13}
          title={"매칭 조건 확장"}
          description="이상형 범위를 넓혀보세요"
          button={
            <Button
              variant={"white"}
              size="chip"
              onPress={() => router.push("/profile-edit/interest")}
              textColor="dark"
              style={styles.editButton}
            >
              수정
            </Button>
          }
          icon={<FrameIcon width={24} height={24} />}
        />
        <NotFoundCard
          iconPadding={8}
          title={"프로필 개선"}
          description={"사진이나 자기소개를 업데이트\n해보세요"}
          button={
            <Button
              onPress={() => router.push("/profile-edit/profile")}
              variant={"white"}
              size="chip"
              textColor="dark"
              style={styles.editButton}
            >
              수정
            </Button>
          }
          icon={<ImproveProfileIcon width={32} height={32} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  image: {
    marginTop: 27,
  },
  title: {
    fontSize: 20,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 24,
    color: semanticColors.text.primary,
  },
  contentContainer: {
    marginTop: 24,
    marginBottom: 24,
    width: "100%",
    paddingHorizontal: 26,
    alignItems: "center",
    gap: 12,
  },
  rematchButton: {
    paddingHorizontal: 7,
    height: 34,
  },
  editButton: {
    paddingHorizontal: 12,
    height: 33,
    borderWidth: 1,
    borderColor: semanticColors.border.default
  },
  frameIcon: {
    width: 38,
    height: 38,
  },
});
