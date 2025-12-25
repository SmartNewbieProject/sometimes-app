import AnimatedLogoRow from "./animated-logo-row";
import { koreaUniversityLogos } from "./korea-logos-data";

interface KoreaUniversityLogosProps {
  logoSize?: number;
}

export default function KoreaUniversityLogos({ logoSize = 48 }: KoreaUniversityLogosProps) {
  return (
    <AnimatedLogoRow
      row1Logos={koreaUniversityLogos.row1}
      row2Logos={koreaUniversityLogos.row2}
      logoSize={logoSize}
      accessibilityLabel="대학교 로고"
    />
  );
}
