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
        rubik: ['Rubik']
      },
    },
  },
  plugins: [],
}

