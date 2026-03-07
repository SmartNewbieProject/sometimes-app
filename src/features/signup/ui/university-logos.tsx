import { useWindowDimensions } from 'react-native';
import { japanUniversityLogos } from './university-logos/japan-logos-data';
import JapanUniversityLogos from './university-logos/japan-university-logos';
import KoreaUniversityLogos from './university-logos/korea-university-logos';

export type CountryCode = 'kr' | 'jp';

interface UniversityLogosProps {
	logoSize?: number;
	country?: CountryCode;
}

export default function UniversityLogos({ logoSize, country = 'kr' }: UniversityLogosProps) {
	const { height } = useWindowDimensions();
	const resolvedSize = logoSize ?? (height > 650 ? 62 : 48);

	const hasJapanLogos =
		japanUniversityLogos?.row1?.length > 0 && japanUniversityLogos?.row2?.length > 0;

	if (country === 'jp' && hasJapanLogos) {
		return <JapanUniversityLogos logoSize={resolvedSize} />;
	}

	return <KoreaUniversityLogos logoSize={resolvedSize} />;
}
