import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Line, Polygon, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { RadarChartProps, RadarDataPoint, RadarChartDimensions } from './types';
import { defaultResponsiveConfig } from './responsive-configs';

const radarChartStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'relative',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  radarLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size,
  maxValue = 5,
  config = defaultResponsiveConfig
}) => {
  // 반응형 설정 선택
  const isMobile = size < config.breakpoint;
  const currentConfig = isMobile ? config.mobile : config.pc;

  // 차트 기본 계산
  const dimensions: RadarChartDimensions = {
    center: size / 2,
    maxRadius: size / 2 - 30,
    scaleFactor: size / 320, // 기준 크기
  };

  const { center, maxRadius, scaleFactor } = dimensions;

  // 데이터 전처리
  const processedData: RadarDataPoint[] = data.map(d => ({
    ...d,
    maxValue: d.maxValue || maxValue,
    color: d.color || '#9333EA',
  }));

  // 현재 최대값 동적 계산
  const actualMaxValue = Math.max(
    ...processedData.map(d => d.maxValue || maxValue)
  );

  // 데이터 렌더링
  const renderRadarData = () => {
    const points = processedData.map(d => {
      const value = Math.min(d.value, d.maxValue || maxValue);
      const radian = (d.angle * Math.PI) / 180;
      const distance = (value / actualMaxValue) * maxRadius;
      const x = center + distance * Math.cos(radian);
      const y = center + distance * Math.sin(radian);
      return `${x},${y}`;
    }).join(' ');

    const backgroundPoints = processedData.map(d => {
      const radian = (d.angle * Math.PI) / 180;
      const x = center + maxRadius * Math.cos(radian);
      const y = center + maxRadius * Math.sin(radian);
      return `${x},${y}`;
    }).join(' ');

    return (
      <>
        {/* Background Grid - 모든 동심원 */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
          const gridPoints = processedData.map(d => {
            const radian = (d.angle * Math.PI) / 180;
            const x = center + maxRadius * scale * Math.cos(radian);
            const y = center + maxRadius * scale * Math.sin(radian);
            return `${x},${y}`;
          }).join(' ');
          return (
            <Polygon
              key={`grid-${scale}`}
              points={gridPoints}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity={0.6}
            />
          );
        })}

        {/* Grid Lines - 모든 방사선 */}
        {processedData.map((d, i) => {
          const radian = (d.angle * Math.PI) / 180;
          const x = center + maxRadius * Math.cos(radian);
          const y = center + maxRadius * Math.sin(radian);
          return (
            <Line
              key={`grid-line-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}

        {/* Background Radar */}
        <Polygon
          points={backgroundPoints}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="1"
        />

        {/* Data Polygon */}
        <Polygon
          points={points}
          fill="url(#radarGradient)"
          fillOpacity={0.3}
          stroke="#9333EA"
          strokeWidth="2"
        />

        {/* Data Points */}
        {processedData.map((d, i) => {
          const value = Math.min(d.value, d.maxValue || maxValue);
          const radian = (d.angle * Math.PI) / 180;
          const distance = (value / actualMaxValue) * maxRadius;
          const x = center + distance * Math.cos(radian);
          const y = center + distance * Math.sin(radian);
          return (
            <Circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill="#9333EA"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Gradient Definition */}
        <Defs>
          <SvgLinearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9333EA" stopOpacity={0.6} />
            <Stop offset="50%" stopColor="#A855F7" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#C084FC" stopOpacity={0.2} />
          </SvgLinearGradient>
        </Defs>
      </>
    );
  };

  // 레이블 렌더링
  const renderRadarLabels = () => {
    return processedData.map((d, i) => {
      // 반응형 레이블 거리 계산
      const labelRadius = maxRadius + currentConfig.labelDistance;
      const radian = (d.angle * Math.PI) / 180;
      const x = center + labelRadius * Math.cos(radian);
      const y = center + labelRadius * Math.sin(radian);

      // 텍스트 정렬 로직
      let alignItems: 'flex-start' | 'center' | 'flex-end' = 'center';
      let textAlign: 'left' | 'center' | 'right' = 'center';

      // 각도 범위별 정렬
      if (d.angle >= -90 && d.angle < -54) {
        alignItems = 'center'; textAlign = 'center';
      } else if (d.angle >= -54 && d.angle < -18) {
        alignItems = 'flex-start'; textAlign = 'left';
      } else if (d.angle >= -18 && d.angle < 18) {
        alignItems = 'flex-start'; textAlign = 'left';
      } else if (d.angle >= 18 && d.angle < 54) {
        alignItems = 'flex-start'; textAlign = 'left';
      } else if (d.angle >= 54 && d.angle < 90) {
        alignItems = 'flex-start'; textAlign = 'left';
      } else if (d.angle >= 90 && d.angle < 126) {
        alignItems = 'center'; textAlign = 'center';
      } else if (d.angle >= 126 && d.angle < 162) {
        alignItems = 'flex-end'; textAlign = 'right';
      } else if (d.angle >= 162 && d.angle < 198) {
        alignItems = 'flex-end'; textAlign = 'right';
      } else if (d.angle >= 198 && d.angle < 234) {
        alignItems = 'flex-end'; textAlign = 'right';
      } else if (d.angle >= 234 && d.angle < 270) {
        alignItems = 'flex-end'; textAlign = 'right';
      } else {
        alignItems = 'center'; textAlign = 'center';
      }

      const horizontalOffset = currentConfig.labelWidth / 2;

      return (
        <View
          key={i}
          style={{
            position: "absolute",
            left: x - horizontalOffset,
            top: y - currentConfig.verticalOffset,
            width: currentConfig.labelWidth,
            alignItems: alignItems,
          }}
        >
          <Text
            size={currentConfig.fontSize}
            weight="semibold"
            textColor="black"
            style={{
              textAlign: textAlign,
              width: '100%',
              lineHeight: currentConfig.lineHeight,
            }}
          >
            {d.label}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={radarChartStyles.container}>
      <View style={radarChartStyles.svgContainer}>
        <Svg width={size} height={size} style={radarChartStyles.svg}>
          {renderRadarData()}
        </Svg>

        {/* Labels */}
        <View style={radarChartStyles.radarLabels}>
          {renderRadarLabels()}
        </View>
      </View>
    </View>
  );
};

export default RadarChart;