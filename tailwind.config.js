import appColors from './src/shared/constants/colors';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ...appColors,
      },
      fontSize: {
        sm: '13px',
        md: '16px',
        lg: '23px',
      },
      fontFamily: {
        thin: ['Pretendard-Thin'],
        extralight: ['Pretendard-ExtraLight'],
        semibold: ['Pretendard-SemiBold'],
        extrabold: ['Pretendard-ExtraBold'],
        bold: ['Pretendard-Bold'],
        black: ['Pretendard-Black'],
        rubik: ['Rubik'],
        ja_thin: ['MPLUS1p-Thin'],
        ja_bold: ['MPLUS1p-Bold'],
        ja_medium: ['MPLUS1p-Medium'],
        ja_regular: ['MPLUS1p-Regular'],
        ja_extrabold: ['MPLUS1p-ExtraBold'],
      },
    },
  },
  plugins: [],
}

