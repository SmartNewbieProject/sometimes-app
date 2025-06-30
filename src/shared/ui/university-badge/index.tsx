import { ImageResource } from "../image-resource";
import { ImageResources } from "../../libs";

type UniversityBadgeProps = {
  authenticated: boolean;
};

export const UniversityBadge = ({ authenticated }: UniversityBadgeProps) => {
  if (!authenticated) return null;
  return <ImageResource resource={ImageResources.UNIV_BADGE} width={24} height={24} />;
};
