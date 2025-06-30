import { ImageResources } from '../../libs';
import { ImageResource } from '../image-resource';

type UniversityBadgeProps = {
	authenticated: boolean;
};

export const UniversityBadge = ({ authenticated }: UniversityBadgeProps) => {
	if (!authenticated) return null;
	return <ImageResource resource={ImageResources.UNIV_BADGE} width={24} height={24} />;
};
