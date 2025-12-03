import { dayUtils } from "@/src/shared/libs";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Loading from "../loading";
import { useMatchLoading } from "./hooks";
import { useLatestMatching } from "./queries";
import type { MatchDetails } from "./types";
import { Waiting } from "./ui";
import { Container } from "./ui/container";
import { InteractionNavigation } from "./ui/nav";
import { NotFound } from "./ui/not-found";
import { Partner } from "./ui/partner";
import { RematchLoading } from "./ui/rematching";

const createDefaultWaitingMatch = (): MatchDetails => ({
  type: "waiting",
  untilNext: dayUtils.create().add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
  partner: null,
  id: null,
  endOfView: null,
  connectionId: null,
});

export default function IdleMatchTimer() {
  const { match, isLoading: matchLoading, refetch } = useLatestMatching();
  const {
    rematchingLoading,
    finishRematching,
    loading: realRematchingLoading,
  } = useMatchLoading();

  useEffect(() => {
    if (rematchingLoading) {
      const timer = setTimeout(() => {
        if (realRematchingLoading) {
          const interval = setInterval(() => {
            if (!realRematchingLoading) {
              clearInterval(interval);
              finishRematching();
            }
          }, 100);
        } else {
          finishRematching();
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [rematchingLoading, realRematchingLoading]);

  if (rematchingLoading) {
    return (
      <View style={styles.container}>
        <Container gradientMode>
          <RematchLoading />
        </Container>
      </View>
    );
  }

  const renderContent = () => {
    if (matchLoading) {
      return <Loading.Lottie />;
    }

    if (!match) {
      return (
        <Waiting
          match={createDefaultWaitingMatch()}
          onTimeEnd={refetch}
        />
      );
    }

    switch (match.type) {
      case "open":
      case "rematching":
        return <Partner match={match} />;
      case "not-found":
        return <NotFound />;
      case "waiting":
        return <Waiting match={match} onTimeEnd={refetch} />;
      default:
        return (
          <Waiting
            match={createDefaultWaitingMatch()}
            onTimeEnd={refetch}
          />
        );
    }
  };

  const isPartnerView = match?.type === "open" || match?.type === "rematching";

  return (
    <View>
      <View style={styles.container}>
        <Container gradientMode={!isPartnerView}>
          {renderContent()}
        </Container>
      </View>
      <InteractionNavigation match={match} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    alignSelf: "center",

    flex: 1,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
  },
});
