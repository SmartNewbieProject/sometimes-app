import i18n from "@shared/libs/i18n";


export type FontWeight =
  | 'thin'
  | 'extralight'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

const fontMap = {
  kr: {
    thin: 'Pretendard-Thin',
    extralight: 'Pretendard-ExtraLight',
    semibold: 'Pretendard-SemiBold',
    bold: 'Pretendard-Bold',
    extrabold: 'Pretendard-ExtraBold',
    black: 'Pretendard-Black',
  },
  ja: {
    thin: 'MPLUS1p-Thin',
    extralight: 'MPLUS1p-Light',
    semibold: 'MPLUS1p-Medium',
    bold: 'MPLUS1p-Bold',
    extrabold: 'MPLUS1p-ExtraBold',
    black: 'MPLUS1p-Black',
  },
};

export function useAppFont(weight: FontWeight) {
  const lang = i18n.language === 'ja' ? 'ja' : 'kr';
  return fontMap[lang][weight];
}
