import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useConfirmProfileImageReview } from "../../hooks/use-confirm-profile-image-review";

export default function ProfileImgEditDoneScreen() {
  const [loading, setLoading] = useState(true);
  const { mutateAsync, isPending } = useConfirmProfileImageReview();

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);

  const onNext = async () => {
    try {
      await mutateAsync();
      router.push("/home");
    } catch (e) {}
  };

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        style={styles.iconWrapper}
      >
        <SmallTitle />
      </IconWrapper>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <View
            style={styles.circleBackground}
          />
          <Image
            source={require("@assets/images/signup-done.png")}
            style={styles.signupImage}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text size="lg" textColor="black" weight="semibold">
              축하드려요!
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              사진 변경이 완료되었어요!
            </Text>
          </View>

          <View style={styles.subtitleContainer}>
            <Text size="sm" textColor="pale-purple" weight="light">
              사진 변경이 완료되었어요!
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              이제 새로운 프로필로 당신의 이상형을 만나보세요.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          style={styles.button}
        >
          {loading ? (
            <>
              <Text textColor={"white"} style={styles.buttonText}>
                잠시만요...
              </Text>
              <ActivityIndicator
                size="small"
                color="#0000ff"
                style={styles.activityIndicator}
              />
            </>
          ) : (
            <Text textColor={"white"} style={styles.buttonText}>
              이상형 찾으러 가기 →
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    color: semanticColors.primaryPurple,
    paddingBottom: 48,
    paddingTop: 48,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
  },
  circleBackground: {
    width: 274,
    height: 274,
    borderRadius: 274,
    top: 12,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    position: 'absolute',
  },
  signupImage: {
    width: 298,
    height: 296,
    marginTop: 50,
  },
  textContainer: {
    flexDirection: 'column',
  },
  titleContainer: {
    marginTop: 42,
  },
  subtitleContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  activityIndicator: {
    marginLeft: 24,
  },
});
