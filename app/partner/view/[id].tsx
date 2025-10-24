import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import Instagram from "@/src/features/instagram";
import useLiked from "@/src/features/like/hooks/use-liked";
import { LikeButton } from "@/src/features/like/ui/like-button";
import {
  ILikedRejectedButton,
  InChatButton,
  LikedMeOpenButton,
} from "@/src/features/post-box/ui/post-box-card";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ChipSelector } from "@/src/widgets";
import Slider from "@/src/widgets/slide";
import PhotoSlider from "@/src/widgets/slide/photo-slider";
import Loading from "@features/loading";
import Match from "@features/match";
import { useCarousel } from "@shared/hooks/use-carousel";
import {
  ImageResources,
  axiosClient,
  cn,
  parser,
  tryCatch,
} from "@shared/libs";

// Feather 아이콘 임포트
import Feather from "@expo/vector-icons/Feather";
import {
  Button,
  Carousel,
  type CarouselRef,
  Header,
  ImageResource,
  PalePurpleGradient,
  Section,
  Show,
  Text,
} from "@shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const { queries, ui } = Match;
const {
  ui: { InstagramContactButton },
} = Instagram;
const { useMatchPartnerQuery } = queries;

export default function PartnerDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading } = useMatchPartnerQuery(matchId);
  const [isSlideScrolling, setSlideScrolling] = useState(false);
  const [isZoomVisible, setZoomVisible] = useState(false);
  const { isStatus, isLiked, isExpired } = useLiked();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onZoomClose = () => {
    setZoomVisible(false);
  };

  const userWithdrawal = !!partner?.deletedAt;

  const loading = (() => {
    if (!partner) return true;
    if (isLoading) return true;
    return false;
  })();

  const characteristicsOptions = parser.getMultipleCharacteristicsOptions(
    ["성격", "연애 스타일", "관심사"],
    partner?.characteristics ?? []
  );

  const personal = characteristicsOptions.성격;
  const loveStyles = characteristicsOptions["연애 스타일"];
  const interests = characteristicsOptions.관심사;

  if (loading || !partner) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  const mainProfileImageUrl = partner.profileImages.find(
    (img) => img.isMain
  )?.url;

  return (
    <View className="flex-1">
      <PhotoSlider
        images={partner?.profileImages.map((item) => item.url) ?? []}
        onClose={onZoomClose}
        initialIndex={selectedIndex}
        visible={isZoomVisible}
      />
      <PalePurpleGradient />

      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={router.back} className="pt-2 -ml-2">
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.RightContent>
          <Pressable // 신고하기 버튼
            onPress={() =>
              router.navigate({
                pathname: "/partner/ban-report",
                params: {
                  partnerId: partner.id,
                  partnerName: partner.name,
                  partnerAge: partner.age,
                  partnerUniv: partner.universityDetails.name,
                  partnerProfileImage: mainProfileImageUrl,
                },
              })
            }
            className="pt-2 -ml-2"
          >
            <Feather name="alert-triangle" size={24} color="#000" />
          </Pressable>
        </Header.RightContent>
      </Header.Container>

      <ScrollView
        scrollEnabled={!isSlideScrolling}
        className="flex-1 px-4 border-t border-t-[#E7E9EC] pt-[22px]"
      >
        <View className="w-full flex justify-center items-center">
          <View style={styles.outerContainer}>
            <View style={{ width: 255, height: 255, overflow: "hidden" }}>
              <LinearGradient
                pointerEvents="none"
                colors={["#F3EDFF", "#9747FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              />
            </View>
            <View
              style={{
                width: 245,
                height: 275,
                overflow: "hidden",
                position: "absolute",
                borderRadius: 20,
                top: 5,
                left: 5,
              }}
            >
              <Slider
                showIndicator={true}
                autoPlayInterval={6000}
                animationDuration={250}
                indicatorContainerClassName="!bottom-[-30px] "
                className={"w-full absolute  "}
                autoPlay
              >
                {partner.profileImages.map((img, index) => (
                  <Pressable
                    onPress={() => {
                      setSelectedIndex(index);
                      setZoomVisible(true);
                    }}
                    key={img.id}
                    style={[styles.itemContainer, { height: 245, width: 245 }]}
                  >
                    <Image
                      source={{ uri: img.url }}
                      style={{
                        ...styles.image,
                        height: 245,
                        width: 245,
                      }}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </Slider>
            </View>

            <View pointerEvents="none" style={styles.textContainer}>
              <Text textColor="white" weight="semibold" className="text-[20px]">
                {partner.age}
              </Text>
              <View className="flex flex-row items-center">
                <Text textColor="white" weight="light" size="sm">
                  {partner.mbti
                    ? `#${partner.mbti} #${
                        partner.universityDetails?.name || ""
                      }`
                    : `#${partner.universityDetails?.name || ""}`}
                </Text>
                {/* &nbsp;<UniversityBadge authenticated={profile.authenticated} /> */}
              </View>
            </View>

            <View pointerEvents="none" style={styles.paperPlane}>
              <ImageResource
                resource={ImageResources.PAPER_PLANE_WITHOUT_BG}
                width={76}
                height={76}
              />
            </View>
            <View pointerEvents="none" style={styles.heart}>
              <ImageResource
                resource={ImageResources.HEART}
                width={64}
                height={64}
              />
            </View>
          </View>
        </View>

        <View className="flex flex-col gap-y-[30px] mt-[24px] mb-[48px]">
          <Section.Container title="기본 정보">
            <Section.Profile title="성별">
              <Text size="md">{parser.gender(partner.gender)}</Text>
            </Section.Profile>
            <Section.Profile title="선호 나이대">
              <Text size="md">
                {parser.getSingleOption(
                  "선호 나이대",
                  partner.characteristics
                ) ?? "상관없음"}
              </Text>
            </Section.Profile>
          </Section.Container>

          <Section.Container title="연애 성향">
            <Section.Profile title="음주">
              <Text size="md">
                {parser.getSingleOption(
                  "음주 선호도",
                  partner.characteristics
                ) ?? ""}
              </Text>
            </Section.Profile>
            <Section.Profile title="흡연">
              <Text size="md">
                {parser.getSingleOption(
                  "흡연 선호도",
                  partner.characteristics
                ) ?? ""}
              </Text>
            </Section.Profile>
            <Section.Profile title="문신">
              <Text size="md">
                {parser.getSingleOption(
                  "문신 선호도",
                  partner.characteristics
                ) ?? ""}
              </Text>
            </Section.Profile>
            {partner.gender === "MALE" && (
              <Section.Profile title="군복무">
                <Text size="md">
                  {parser.getSingleOption(
                    "군필 여부",
                    partner.characteristics
                  ) ?? ""}
                </Text>
              </Section.Profile>
            )}

            <View
              style={[
                styles.datingStyleContainer,
                {
                  flexDirection: loveStyles.length === 1 ? "row" : "column",
                  alignItems: loveStyles.length === 1 ? "center" : "flex-start",
                  justifyContent:
                    loveStyles.length === 1 ? "space-between" : "flex-start",
                },
              ]}
            >
              <Text size="md" textColor="black" className="mb-[10px] ">
                연애 스타일
              </Text>
              <ChipSelector
                value={[]}
                options={loveStyles}
                className={cn(
                  "w-full flex-1 ",
                  loveStyles.length === 1 && "justify-end"
                )}
                onChange={() => {}}
              />
            </View>
          </Section.Container>

          <Section.Container title="성격/기질">
            <Section.Profile title="MBTI">
              <Text size="md">{partner.mbti}</Text>
            </Section.Profile>
            <View className="flex flex-col w-full">
              <Text size="md" textColor="black" className="mb-[10px]">
                성격 유형
              </Text>
              <ChipSelector
                value={[]}
                options={personal}
                className="w-full"
                onChange={() => {}}
              />
            </View>
          </Section.Container>

          <Section.Container title="라이프스타일">
            <View className="flex flex-col w-full">
              <ChipSelector
                value={[]}
                options={interests}
                className="w-full"
                onChange={() => {}}
              />
            </View>
          </Section.Container>
        </View>
      </ScrollView>

      <View
        style={{
          marginBottom: 36,
          height: 48,
          marginTop: 6,
          marginLeft: 16,
          marginRight: 16,
        }}
      >
        <Show
          when={
            isStatus(partner?.connectionId ?? "") === "OPEN" &&
            isStatus(partner?.connectionId ?? "") !== "IN_CHAT"
          }
        >
          <View
            style={{ width: "100%", flex: 1, flexDirection: "row", height: 48 }}
          >
            <LikedMeOpenButton
              height={48}
              matchId={matchId}
              likeId={partner?.matchLikeId ?? undefined}
            />
          </View>
        </Show>

        <Show
          when={
            !(isStatus(partner?.connectionId ?? "") === "OPEN") &&
            !isLiked(partner?.connectionId ?? "") &&
            !!partner?.connectionId &&
            !(isStatus(partner?.connectionId ?? "") === "IN_CHAT")
          }
        >
          <View
            style={{
              width: "100%",
              flex: 1,
              flexDirection: "row",
              height: 48,
            }}
          >
            <LikeButton connectionId={partner.connectionId ?? ""} />
          </View>
        </Show>
        <Show
          when={
            !isExpired(partner?.connectionId ?? "") &&
            isStatus(partner?.connectionId ?? "") === "PENDING"
          }
        >
          <View className="w-full flex flex-row">
            <Button
              variant="outline"
              disabled={true}
              size="md"
              className={cn("flex-1 items-center ", `!h-[${20}px]`)}
            >
              <Text>상대방 응답을 기다리는 중..</Text>
            </Button>
          </View>
        </Show>
        <Show
          when={
            isExpired(partner?.connectionId ?? "") ||
            isStatus(partner?.connectionId ?? "") === "REJECTED" ||
            userWithdrawal
          }
        >
          <ILikedRejectedButton
            height={48}
            connectionId={partner?.connectionId ?? ""}
          />
        </Show>
        <Show when={isStatus(partner?.connectionId ?? "") === "IN_CHAT"}>
          <InChatButton height={48} />
        </Show>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: 255,

    height: 275,
    position: "relative",
  },
  gradientBorder: {
    borderRadius: 20,
    padding: 5,
    width: 255,
    height: 255,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  container: {
    borderRadius: 15,
    overflow: "hidden",
    width: "100%",
    height: "100%",
    position: "relative",
  },

  textContainer: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    left: 14,
    bottom: 28,
    zIndex: 10,
  },
  paperPlane: {
    position: "absolute",
    right: -42,
    bottom: 16,
  },
  heart: {
    position: "absolute",
    left: -44,
    top: 16,
    zIndex: -1,
  },

  itemContainer: {
    width: 245,

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    overflow: "hidden",
    height: "100%",
  },
  datingStyleContainer: {
    width: "100%",
  },
});
