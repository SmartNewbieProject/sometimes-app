import { ResponsiveConfig } from './types';

export const defaultResponsiveConfig: ResponsiveConfig = {
  mobile: {
    labelDistance: 30,    // 모바일: 차트와 가까운 레이블
    labelWidth: 80,       // 좁은 너비
    fontSize: 9,          // 작은 폰트
    lineHeight: 12,       // 촘촘한 줄 간격
    verticalOffset: 8,    // 적은 수직 간격
  },
  pc: {
    labelDistance: 50,    // PC: 차트와 먼 레이블
    labelWidth: 120,      // 넓은 너비
    fontSize: 12,         // 큰 폰트
    lineHeight: 16,       // 여유로운 줄 간격
    verticalOffset: 12,   // 넓은 수직 간격
  },
  breakpoint: 768,        // 모바일/PC 구분 기준
};

// 커스텀 설정 생성 헬퍼
export const createResponsiveConfig = (custom: Partial<ResponsiveConfig>): ResponsiveConfig => ({
  mobile: { ...defaultResponsiveConfig.mobile, ...custom.mobile },
  pc: { ...defaultResponsiveConfig.pc, ...custom.pc },
  breakpoint: custom.breakpoint || defaultResponsiveConfig.breakpoint,
});