import { ImageResources } from "@/src/shared/libs";
import { Button, ImageResource, Text } from "@/src/shared/ui";
import FrameIcon from "@assets/icons/frame.svg";
import ImproveProfileIcon from "@assets/icons/improve-profile.svg";
import ReloadingIcon from "@assets/icons/reloading.svg";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import useRematch from "../hooks/use-rematch";
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
              className="!px-[7px] !h-[34px] "
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
              className="!px-[12px] !h-[33px]  !border-[#D1D5DB]"
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
              className="!px-[12px] !h-[33px]  !border-[#D1D5DB]"
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
    lineHeight: 24,
    color: "#000",
  },
  contentContainer: {
    marginTop: 24,
    marginBottom: 24,
    width: "100%",
    paddingHorizontal: 26,
    alignItems: "center",
    gap: 12,
  },
  button: {
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  frameIcon: {
    width: 38,
    height: 38,
  },
});
