import { ImageResources } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { Image } from "expo-image";
import { useAuth } from "../../auth";

type MockLikeButtonProps = {
  className?: string;
};

export const MockLikeButton = ({ className = "" }: MockLikeButtonProps) => {
  const { profileDetails } = useAuth();
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();

  const handleClick = () => {
    showModal({
      showLogo: true,
      showParticle: true,
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text textColor="black" weight="bold" size="20">
            썸을 보냈어요!
          </Text>
        </View>
      ),
      children: (
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            상대방도 관심을 보이면,
          </Text>
          <Text style={styles.modalText}>
            인스타그램으로 연락할 수 있어요
          </Text>
        </View>
      ),
      primaryButton: {
        text: "확인했어요",
        onClick: () => {},
      },
    });
  };

  const showPartnerLikeAnnouncement = () => {
    showModal({
      showLogo: true,
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text textColor="black" weight="bold" size="20">
            마음에 드는 이성에게
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {profileDetails?.gender === "MALE"
              ? `구슬 ${featureCosts?.LIKE_MESSAGE}개로 관심을 표현할까요?`
              : "관심을 표현할까요?"}
          </Text>
        </View>
      ),
      children: (
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            이성에게 간단히 관심을 표현하고,
          </Text>
          <Text style={styles.modalText}>
            그 다음 단계로 자연스럽게 나아가 보세요.
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        onClick: handleClick,
      },
      secondaryButton: {
        text: "아니요",
        onClick: hideModal,
      },
    });
  };

  return (
    <Button
      onPress={showPartnerLikeAnnouncement}
      variant="primary"
      style={styles.button}
      prefix={
        profileDetails?.gender === "MALE" ? (
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        ) : (
          <></>
        )
      }
    >
      <View style={styles.buttonContent}>
        {profileDetails?.gender === "MALE" ? (
          <RNText style={styles.subText}>x{featureCosts?.LIKE_MESSAGE}</RNText>
        ) : (
          <></>
        )}
        <RNText style={styles.buttonText}>좋아요</RNText>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: semanticColors.text.inverse,
    whiteSpace: 'nowrap',
  },
  modalContent: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  modalText: {
    fontSize: 12,
    color: semanticColors.text.disabled,
  },
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 18,
    marginLeft: -5,
    marginRight: 6,
    color: semanticColors.brand.accent,
  },
  particle1: {
    position: "absolute",
    left: -6,
    bottom: -36,
    width: 66,
    height: 34,
  },
  particle2: {
    position: "absolute",
    left: 10,
    top: -48,
    width: 52,
    height: 49,
  },
  particle3: {
    position: "absolute",
    right: -20,
    top: -40,
    width: 105,
    height: 80,
  },
});

export default MockLikeButton;
