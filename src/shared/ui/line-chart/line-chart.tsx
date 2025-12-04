import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Text } from '../text';
import { styles } from './line-chart.styles';
import type { LineChartProps, DataPoint } from './line-chart.types';

const DEFAULT_HEIGHT = 140;
const DEFAULT_Y_AXIS_WIDTH = 30;
const DEFAULT_LINE_COLOR = '#7C3AED';
const DEFAULT_GRID_COLOR = '#E0E0E0';
const DEFAULT_TREND_COLORS = {
  up: '#10B981',
  down: '#EF4444',
  stable: '#7C3AED',
};

export const LineChart = ({
  data,
  height = DEFAULT_HEIGHT,
  minValue,
  maxValue,
  lineColor = DEFAULT_LINE_COLOR,
  gridColor = DEFAULT_GRID_COLOR,
  showGrid = true,
  showTrendIndicators = true,
  yAxisLabels,
  trendColors = DEFAULT_TREND_COLORS,
}: LineChartProps) => {
  const [chartWidth, setChartWidth] = useState(0);

  const dataPoints = data.map(d => d.value);
  const calculatedMin = minValue ?? Math.min(...dataPoints, 0);
  const calculatedMax = maxValue ?? Math.max(...dataPoints, 100);

  const xStep = chartWidth > 0 && data.length > 1
    ? chartWidth / (data.length - 1)
    : 0;

  const getY = (value: number) => {
    const range = calculatedMax - calculatedMin;
    if (range === 0) return height / 2;
    return height - ((value - calculatedMin) / range) * height;
  };

  const pathData = data
    .map((point, index) => {
      const x = index * xStep;
      const y = getY(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return trendColors.up;
      case 'down': return trendColors.down;
      default: return trendColors.stable;
    }
  };

  const renderTrendArrow = (x: number, y: number, trend: string) => {
    if (trend === 'up') {
      return (
        <>
          <Line x1={x} y1={y - 8} x2={x} y2={y - 12} stroke={trendColors.up} strokeWidth="2" />
          <Line x1={x - 2} y1={y - 10} x2={x} y2={y - 12} stroke={trendColors.up} strokeWidth="2" />
          <Line x1={x + 2} y1={y - 10} x2={x} y2={y - 12} stroke={trendColors.up} strokeWidth="2" />
        </>
      );
    }
    if (trend === 'down') {
      return (
        <>
          <Line x1={x} y1={y + 8} x2={x} y2={y + 12} stroke={trendColors.down} strokeWidth="2" />
          <Line x1={x - 2} y1={y + 10} x2={x} y2={y + 12} stroke={trendColors.down} strokeWidth="2" />
          <Line x1={x + 2} y1={y + 10} x2={x} y2={y + 12} stroke={trendColors.down} strokeWidth="2" />
        </>
      );
    }
    return null;
  };

  const defaultYLabels = yAxisLabels || [
    String(calculatedMax),
    String(Math.round((calculatedMax + calculatedMin) / 2)),
    String(calculatedMin),
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.yAxisLabels, { width: DEFAULT_Y_AXIS_WIDTH, height }]}>
        {defaultYLabels.map((label, index) => (
          <Text key={index} size="10" weight="normal" textColor="gray">
            {label}
          </Text>
        ))}
      </View>

      <View
        style={styles.chartWrapper}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {chartWidth > 0 && (
          <>
            <Svg width={chartWidth} height={height}>
              {showGrid && (
                <>
                  <Line x1="0" y1="0" x2={chartWidth} y2="0" stroke={gridColor} strokeWidth="1" />
                  <Line x1="0" y1={height * 0.5} x2={chartWidth} y2={height * 0.5} stroke={gridColor} strokeWidth="1" />
                  <Line x1="0" y1={height} x2={chartWidth} y2={height} stroke={gridColor} strokeWidth="1" />

                  {data.map((_, index) => {
                    const x = index * xStep;
                    return (
                      <Line
                        key={`vline-${index}`}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={height}
                        stroke={gridColor}
                        strokeWidth="1"
                      />
                    );
                  })}
                </>
              )}

              <Path
                d={pathData}
                stroke={lineColor}
                strokeWidth="3"
                fill="none"
              />

              {data.map((point, index) => {
                const x = index * xStep;
                const y = getY(point.value);
                const trend = point.trend || 'stable';

                return (
                  <React.Fragment key={index}>
                    <Circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill={getTrendColor(trend)}
                    />
                    {showTrendIndicators && renderTrendArrow(x, y, trend)}
                  </React.Fragment>
                );
              })}
            </Svg>

            <View style={styles.xAxisLabels}>
              {data.map((point, index) => (
                <Text key={index} size="10" weight="normal" textColor="gray">
                  {point.label}
                </Text>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
};
