export type TrendDirection = 'up' | 'down' | 'stable';

export interface DataPoint {
  value: number;
  label: string;
  trend?: TrendDirection;
}

export interface LineChartProps {
  data: DataPoint[];
  height?: number;
  minValue?: number;
  maxValue?: number;
  lineColor?: string;
  gridColor?: string;
  showGrid?: boolean;
  showTrendIndicators?: boolean;
  yAxisLabels?: string[];
  trendColors?: {
    up: string;
    down: string;
    stable: string;
  };
}

export interface LineChartDimensions {
  chartWidth: number;
  chartHeight: number;
  yAxisWidth: number;
}
