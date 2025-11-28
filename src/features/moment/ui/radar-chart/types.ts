export interface RadarDataPoint {
  label: string;
  value: number;
  angle: number;
  maxValue?: number;
  color?: string;
}

export interface RadarChartProps {
  data: RadarDataPoint[];
  size: number;
  maxValue?: number;
  config?: ResponsiveConfig;
}

export interface ResponsiveConfig {
  mobile: {
    labelDistance: number;
    labelWidth: number;
    fontSize: number;
    lineHeight: number;
    verticalOffset: number;
  };
  pc: {
    labelDistance: number;
    labelWidth: number;
    fontSize: number;
    lineHeight: number;
    verticalOffset: number;
  };
  breakpoint: number; // 모바일/PC 구분 기준
}

export interface RadarChartDimensions {
  center: number;
  maxRadius: number;
  scaleFactor: number;
}