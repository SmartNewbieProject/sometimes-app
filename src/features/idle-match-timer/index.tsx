import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Loading from "../loading";
import { useMatchLoading } from "./hooks";
import { useLatestMatching } from "./queries";
import { Waiting } from "./ui";
import { Container } from "./ui/container";
import { InteractionNavigation } from "./ui/nav";
import { NotFound } from "./ui/not-found";
import { Partner } from "./ui/partner";
import { RematchLoading } from "./ui/rematching";

export default function IdleMatchTimer() {
  const { match, isLoading: matchLoading, refetch } = useLatestMatching();
  const { my } = useAuth();
  const { rematchingLoading, finishRematching } = useMatchLoading();

  const isOpen = match?.type
    ? ["open", "rematching"].includes(match.type)
    : false;

  const loading = (() => {
    if (!my || !match || matchLoading) return true;
    return false;
  })();

  useEffect(() => {
    if (rematchingLoading) {
      setTimeout(() => {
        finishRematching();
      }, 4000);
    }
  }, [rematchingLoading]);

  console.log("loading", match?.type);
  if (rematchingLoading) {
    return (
      <View style={styles.container}>
        <Container gradientMode>
          <RematchLoading />
        </Container>
      </View>
    );
  }

  // return (
  //   <View>
  //     <View style={styles.container}>
  //       <Container gradientMode>
  //         <PreOpening />
  //       </Container>
  //     </View>
  //   </View>
  // );

  return (
    <View>
      <View style={styles.container}>
        <Loading.Lottie title="불러오고 있어요" loading={loading}>
          <Container
            gradientMode={["not-found", "waiting"].includes(
              match?.type as string
            )}
          >
            {match?.type === "not-found" && <NotFound />}
            {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
            {isOpen && <Partner match={match!} />}
            {match?.type === "waiting" && (
              <Waiting match={match} onTimeEnd={refetch} />
            )}
            {/* <Waiting match={match!} onTimeEnd={onTimeEnd} />  */}
          </Container>
        </Loading.Lottie>
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
