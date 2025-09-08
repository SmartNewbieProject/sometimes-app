import { DefaultLayout } from "@/src/features/layout/ui";
import { useSignupProgress } from "@/src/features/signup/hooks";
import { getAreaByCode } from "@/src/features/signup/lib";
import useUniversitiesByArea from "@/src/features/signup/queries/use-universities-by-area";
import { useGlobalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function UniversityCluster() {
  const {
    form: { universityId },
    univTitle,
    regions,
  } = useSignupProgress();

  const { data } = useUniversitiesByArea(regions);

  const areaList = getAreaByCode(regions[0]);
  console.log("나오나????", univTitle, data, areaList);
  return (
    <DefaultLayout>
      <Text>잘떠라 얍!</Text>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({});

export default UniversityCluster;
