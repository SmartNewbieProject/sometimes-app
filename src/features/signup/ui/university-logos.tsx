import { japanUniversityLogos } from './university-logos/japan-logos-data';
import JapanUniversityLogos from './university-logos/japan-university-logos';
import KoreaUniversityLogos from './university-logos/korea-university-logos';

export type CountryCode = 'kr' | 'jp';

interface UniversityLogosProps {
	logoSize?: number;
	country?: CountryCode;
}

export default function UniversityLogos({ logoSize = 48, country = 'kr' }: UniversityLogosProps) {
	const hasJapanLogos =
		japanUniversityLogos?.row1?.length > 0 && japanUniversityLogos?.row2?.length > 0;

	if (country === 'jp' && hasJapanLogos) {
		return <JapanUniversityLogos logoSize={logoSize} />;
	}

	return <KoreaUniversityLogos logoSize={logoSize} />;
}
