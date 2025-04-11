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
        sm: '15px',
        md: '18px',
        lg: '25px',
      },
      fontFamily: {
        thin: ['Pretendard-Thin'],
        extralight: ['Pretendard-ExtraLight'],
        semibold: ['Pretendard-SemiBold'],
        extrabold: ['Pretendard-ExtraBold'],
        bold: ['Pretendard-Bold'],
        black: ['Pretendard-Black'],
      },
    },
  },
  plugins: [],
}

