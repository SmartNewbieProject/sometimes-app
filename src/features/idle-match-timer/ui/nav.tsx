import { ImageResources, axiosClient, tryCatch } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import { View } from "react-native";
import type { MatchDetails } from "../types";

import Instagram from "../../instagram";
import useRematch from "../hooks/use-rematch";

const {
  ui: { InstagramContactButton },
} = Instagram;

type InteractionNavigationProps = {
  match?: MatchDetails;
};

export const InteractionNavigation = ({
  match,
}: InteractionNavigationProps) => {
  const hasPartner = !!match?.partner;
  const { onRematch } = useRematch();

  return (
    <View className="w-full flex flex-row gap-x-2 mt-4">
      <Button
        onPress={onRematch}
        variant="primary"
        className="flex-1"
        prefix={
          <ImageResource
            resource={ImageResources.TICKET}
            width={32}
            height={32}
          />
        }
      >
        재매칭권 사용하기
      </Button>
      {hasPartner && (
        <InstagramContactButton
          instagramId={match?.partner?.instagramId as string}
        />
      )}
    </View>
  );
};
