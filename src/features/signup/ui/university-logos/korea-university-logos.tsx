import AnimatedLogoRow from "./animated-logo-row";
import { useTranslation } from 'react-i18next';
import { koreaUniversityLogos } from "./korea-logos-data";

interface KoreaUniversityLogosProps {
  logoSize?: number;
}

export default function KoreaUniversityLogos({ logoSize = 48 }: KoreaUniversityLogosProps) {
  const { t } = useTranslation();

  return (
    <AnimatedLogoRow
      row1Logos={koreaUniversityLogos.row1}
      row2Logos={koreaUniversityLogos.row2}
      logoSize={logoSize}
      accessibilityLabel={t("common.대학교_로고")}
    />
  );
}
