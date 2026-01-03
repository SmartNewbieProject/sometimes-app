# Chapter 39: 실전 프로젝트 - 데이터 시각화

Part 5에서 배운 모든 그래픽 기술을 종합해 실제 데이터 시각화 컴포넌트를 구현합니다. 차트, 그래프, 대시보드를 애니메이션과 함께 구축하며, 사용자 인터랙션에 반응하는 동적 시각화를 만들어봅니다.

## 📌 학습 목표

- 다양한 차트 유형 구현 (라인, 바, 파이, 레이더)
- 데이터 변화에 따른 부드러운 전환 애니메이션
- 터치 인터랙션과 툴팁 구현
- 실시간 데이터 스트리밍 시각화
- 종합 대시보드 구성

## 📖 데이터 시각화의 원칙

### 시각화 설계 기본 원칙

```
┌─────────────────────────────────────────────────┐
│           데이터 시각화 파이프라인              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Raw Data → Transform → Scale → Render → Animate│
│                                                 │
│  [배열] → [정규화] → [좌표변환] → [SVG/Skia] → [Reanimated]
│                                                 │
└─────────────────────────────────────────────────┘
```

**핵심 원칙:**
1. **명확성**: 데이터의 의미가 즉시 전달되어야 함
2. **정확성**: 시각적 표현이 실제 값을 정확히 반영
3. **반응성**: 데이터 변화에 부드럽게 반응
4. **인터랙션**: 사용자가 데이터를 탐색할 수 있음

## 💻 라인 차트 구현

### 기본 라인 차트

```typescript
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path, G, Line, Text as SvgText, Circle } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  padding?: number;
  lineColor?: string;
  showPoints?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

export function LineChart({
  data,
  width = SCREEN_WIDTH - 40,
  height = 200,
  padding = 40,
  lineColor = '#7A4AE2',
  showPoints = true,
  showGrid = true,
  animated = true,
}: LineChartProps) {
  const progress = useSharedValue(0);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 데이터 범위 계산
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));

  // 스케일 함수
  const scaleX = (x: number) => {
    return padding + ((x - minX) / (maxX - minX)) * chartWidth;
  };

  const scaleY = (y: number) => {
    return height - padding - ((y - minY) / (maxY - minY)) * chartHeight;
  };

  // SVG 경로 생성
  const linePath = data
    .map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // 경로 길이 계산 (대략적)
  const pathLength = useDerivedValue(() => {
    let length = 0;
    for (let i = 1; i < data.length; i++) {
      const x1 = scaleX(data[i - 1].x);
      const y1 = scaleY(data[i - 1].y);
      const x2 = scaleX(data[i].x);
      const y2 = scaleY(data[i].y);
      length += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    return length;
  });

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDasharray: pathLength.value,
    strokeDashoffset: pathLength.value * (1 - progress.value),
  }));

  React.useEffect(() => {
    if (animated) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 1500 });
    } else {
      progress.value = 1;
    }
  }, [data]);

  // 그리드 라인 생성
  const gridLines = [];
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const y = padding + (chartHeight / yTicks) * i;
    const value = maxY - ((maxY - minY) / yTicks) * i;
    gridLines.push({ y, value });
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* 그리드 */}
        {showGrid && (
          <G>
            {gridLines.map((line, index) => (
              <G key={index}>
                <Line
                  x1={padding}
                  y1={line.y}
                  x2={width - padding}
                  y2={line.y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={padding - 8}
                  y={line.y + 4}
                  fontSize={10}
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {line.value.toFixed(0)}
                </SvgText>
              </G>
            ))}
          </G>
        )}

        {/* 라인 */}
        <AnimatedPath
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={animatedLineProps}
        />

        {/* 데이터 포인트 */}
        {showPoints && data.map((point, index) => (
          <AnimatedDataPoint
            key={index}
            cx={scaleX(point.x)}
            cy={scaleY(point.y)}
            progress={progress}
            index={index}
            total={data.length}
            color={lineColor}
          />
        ))}

        {/* X축 라벨 */}
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((point, index) => (
          <SvgText
            key={index}
            x={scaleX(point.x)}
            y={height - padding + 20}
            fontSize={10}
            fill="#9CA3AF"
            textAnchor="middle"
          >
            {point.label || point.x}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

// 애니메이션 데이터 포인트
function AnimatedDataPoint({
  cx,
  cy,
  progress,
  index,
  total,
  color,
}: {
  cx: number;
  cy: number;
  progress: Animated.SharedValue<number>;
  index: number;
  total: number;
  color: string;
}) {
  const pointProgress = useDerivedValue(() => {
    const threshold = index / total;
    if (progress.value < threshold) return 0;
    return Math.min(1, (progress.value - threshold) / (1 / total) * 2);
  });

  const animatedProps = useAnimatedProps(() => ({
    r: 5 * pointProgress.value,
    opacity: pointProgress.value,
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill="white"
      stroke={color}
      strokeWidth={2}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
});
```

### 인터랙티브 라인 차트

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface InteractiveLineChartProps extends LineChartProps {
  onPointSelect?: (point: DataPoint, index: number) => void;
}

export function InteractiveLineChart({
  data,
  width = SCREEN_WIDTH - 40,
  height = 200,
  padding = 40,
  lineColor = '#7A4AE2',
  onPointSelect,
}: InteractiveLineChartProps) {
  const touchX = useSharedValue(-1);
  const selectedIndex = useSharedValue(-1);
  const tooltipOpacity = useSharedValue(0);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));

  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX)) * chartWidth;
  const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * chartHeight;
  const inverseScaleX = (px: number) => minX + ((px - padding) / chartWidth) * (maxX - minX);

  // 가장 가까운 데이터 포인트 찾기
  const findClosestPoint = (x: number) => {
    'worklet';
    const dataX = inverseScaleX(x);
    let closestIndex = 0;
    let closestDistance = Math.abs(data[0].x - dataX);

    for (let i = 1; i < data.length; i++) {
      const distance = Math.abs(data[i].x - dataX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      if (e.x >= padding && e.x <= width - padding) {
        touchX.value = e.x;
        selectedIndex.value = findClosestPoint(e.x);
        tooltipOpacity.value = withTiming(1, { duration: 150 });
      }
    })
    .onUpdate((e) => {
      if (e.x >= padding && e.x <= width - padding) {
        touchX.value = e.x;
        selectedIndex.value = findClosestPoint(e.x);
      }
    })
    .onEnd(() => {
      tooltipOpacity.value = withTiming(0, { duration: 300 });
      if (selectedIndex.value >= 0 && onPointSelect) {
        runOnJS(onPointSelect)(data[selectedIndex.value], selectedIndex.value);
      }
    });

  // 툴팁 위치
  const tooltipStyle = useAnimatedStyle(() => {
    if (selectedIndex.value < 0) return { opacity: 0 };

    const point = data[selectedIndex.value];
    const x = scaleX(point.x);
    const y = scaleY(point.y);

    return {
      opacity: tooltipOpacity.value,
      transform: [
        { translateX: x - 40 },
        { translateY: y - 50 },
      ],
    };
  });

  // 크로스헤어 라인
  const crosshairStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateX: touchX.value }],
  }));

  // 선택된 포인트 하이라이트
  const highlightStyle = useAnimatedStyle(() => {
    if (selectedIndex.value < 0) return { opacity: 0 };

    const point = data[selectedIndex.value];
    const x = scaleX(point.x);
    const y = scaleY(point.y);

    return {
      opacity: tooltipOpacity.value,
      transform: [
        { translateX: x - 8 },
        { translateY: y - 8 },
      ],
    };
  });

  const linePath = data
    .map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <GestureDetector gesture={panGesture}>
        <View>
          <Svg width={width} height={height}>
            <Path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((point, index) => (
              <Circle
                key={index}
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r={4}
                fill="white"
                stroke={lineColor}
                strokeWidth={2}
              />
            ))}
          </Svg>

          {/* 크로스헤어 */}
          <Animated.View style={[styles.crosshair, crosshairStyle]}>
            <View style={styles.crosshairLine} />
          </Animated.View>

          {/* 선택된 포인트 */}
          <Animated.View style={[styles.highlight, highlightStyle]}>
            <View style={[styles.highlightCircle, { borderColor: lineColor }]} />
          </Animated.View>

          {/* 툴팁 */}
          <Animated.View style={[styles.tooltip, tooltipStyle]}>
            <TooltipContent
              data={data}
              selectedIndex={selectedIndex}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

function TooltipContent({
  data,
  selectedIndex,
}: {
  data: DataPoint[];
  selectedIndex: Animated.SharedValue<number>;
}) {
  const [index, setIndex] = React.useState(0);

  useAnimatedReaction(
    () => selectedIndex.value,
    (value) => {
      if (value >= 0) {
        runOnJS(setIndex)(value);
      }
    }
  );

  const point = data[index];
  if (!point) return null;

  return (
    <View style={styles.tooltipBox}>
      <Text style={styles.tooltipLabel}>{point.label || `X: ${point.x}`}</Text>
      <Text style={styles.tooltipValue}>{point.y.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  crosshair: {
    position: 'absolute',
    top: 40,
    height: 120,
    width: 1,
  },
  crosshairLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  highlight: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  highlightCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: 'white',
  },
  tooltip: {
    position: 'absolute',
    width: 80,
  },
  tooltipBox: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  tooltipLabel: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  tooltipValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

## 💻 바 차트 구현

### 애니메이션 바 차트

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface BarData {
  value: number;
  label: string;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  showValues?: boolean;
  animated?: boolean;
}

export function BarChart({
  data,
  width = SCREEN_WIDTH - 40,
  height = 200,
  barWidth = 40,
  gap = 12,
  showValues = true,
  animated = true,
}: BarChartProps) {
  const progress = useSharedValue(0);

  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = height - 40; // 라벨 공간

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1000 });
  }, [data]);

  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const startX = (width - totalWidth) / 2;

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.chartArea}>
        {data.map((item, index) => (
          <AnimatedBar
            key={index}
            data={item}
            index={index}
            progress={progress}
            maxValue={maxValue}
            chartHeight={chartHeight}
            barWidth={barWidth}
            gap={gap}
            startX={startX}
            showValues={showValues}
            animated={animated}
          />
        ))}
      </View>
    </View>
  );
}

function AnimatedBar({
  data,
  index,
  progress,
  maxValue,
  chartHeight,
  barWidth,
  gap,
  startX,
  showValues,
  animated,
}: {
  data: BarData;
  index: number;
  progress: Animated.SharedValue<number>;
  maxValue: number;
  chartHeight: number;
  barWidth: number;
  gap: number;
  startX: number;
  showValues: boolean;
  animated: boolean;
}) {
  const barHeight = (data.value / maxValue) * chartHeight;
  const x = startX + index * (barWidth + gap);
  const color = data.color || '#7A4AE2';

  const barStyle = useAnimatedStyle(() => {
    const delayedProgress = animated
      ? interpolate(
          progress.value,
          [index / (index + 2), 1],
          [0, 1],
          'clamp'
        )
      : 1;

    return {
      height: barHeight * delayedProgress,
      opacity: delayedProgress,
    };
  });

  const valueStyle = useAnimatedStyle(() => {
    const delayedProgress = animated
      ? interpolate(
          progress.value,
          [(index + 0.5) / (index + 2), 1],
          [0, 1],
          'clamp'
        )
      : 1;

    return {
      opacity: delayedProgress,
      transform: [
        { translateY: interpolate(delayedProgress, [0, 1], [10, 0]) },
      ],
    };
  });

  return (
    <View style={[styles.barContainer, { left: x, width: barWidth }]}>
      {showValues && (
        <Animated.Text style={[styles.barValue, valueStyle]}>
          {data.value.toLocaleString()}
        </Animated.Text>
      )}

      <Animated.View
        style={[
          styles.bar,
          { backgroundColor: color, width: barWidth },
          barStyle,
        ]}
      />

      <Text style={styles.barLabel} numberOfLines={1}>
        {data.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  barContainer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
```

### 수평 바 차트

```typescript
interface HorizontalBarData {
  value: number;
  label: string;
  color?: string;
}

export function HorizontalBarChart({
  data,
  width = SCREEN_WIDTH - 40,
  barHeight = 32,
  gap = 8,
}: {
  data: HorizontalBarData[];
  width?: number;
  barHeight?: number;
  gap?: number;
}) {
  const progress = useSharedValue(0);

  const maxValue = Math.max(...data.map(d => d.value));
  const labelWidth = 80;
  const valueWidth = 60;
  const chartWidth = width - labelWidth - valueWidth;

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1200 });
  }, [data]);

  return (
    <View style={[styles.container, { width }]}>
      {data.map((item, index) => (
        <HorizontalBar
          key={index}
          data={item}
          index={index}
          progress={progress}
          maxValue={maxValue}
          chartWidth={chartWidth}
          barHeight={barHeight}
          gap={gap}
          labelWidth={labelWidth}
          valueWidth={valueWidth}
        />
      ))}
    </View>
  );
}

function HorizontalBar({
  data,
  index,
  progress,
  maxValue,
  chartWidth,
  barHeight,
  gap,
  labelWidth,
  valueWidth,
}: {
  data: HorizontalBarData;
  index: number;
  progress: Animated.SharedValue<number>;
  maxValue: number;
  chartWidth: number;
  barHeight: number;
  gap: number;
  labelWidth: number;
  valueWidth: number;
}) {
  const targetWidth = (data.value / maxValue) * chartWidth;
  const color = data.color || '#7A4AE2';

  const barStyle = useAnimatedStyle(() => {
    const delay = index * 0.1;
    const adjustedProgress = Math.max(0, (progress.value - delay) / (1 - delay));

    return {
      width: withSpring(targetWidth * adjustedProgress, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const valueStyle = useAnimatedStyle(() => {
    const delay = index * 0.1 + 0.3;
    const adjustedProgress = Math.max(0, (progress.value - delay) / (1 - delay));

    return {
      opacity: adjustedProgress,
    };
  });

  return (
    <View style={[styles.horizontalBarRow, { height: barHeight, marginBottom: gap }]}>
      <Text style={[styles.horizontalLabel, { width: labelWidth }]} numberOfLines={1}>
        {data.label}
      </Text>

      <View style={[styles.horizontalBarBg, { width: chartWidth }]}>
        <Animated.View
          style={[
            styles.horizontalBar,
            { backgroundColor: color, height: barHeight * 0.6 },
            barStyle,
          ]}
        />
      </View>

      <Animated.Text
        style={[styles.horizontalValue, { width: valueWidth }, valueStyle]}
      >
        {data.value.toLocaleString()}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalLabel: {
    fontSize: 12,
    color: '#374151',
  },
  horizontalBarBg: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  horizontalBar: {
    borderRadius: 4,
  },
  horizontalValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
  },
});
```

## 💻 파이 차트 구현

### 애니메이션 파이 차트

```typescript
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PieData {
  value: number;
  label: string;
  color: string;
}

interface PieChartProps {
  data: PieData[];
  size?: number;
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}

export function PieChart({
  data,
  size = 200,
  innerRadius = 0, // 0이면 파이, > 0이면 도넛
  showLabels = true,
  showLegend = true,
}: PieChartProps) {
  const progress = useSharedValue(0);

  const center = size / 2;
  const outerRadius = size / 2 - 10;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  // 각 조각의 시작/끝 각도 계산
  let currentAngle = -90; // 12시 방향에서 시작
  const slices = data.map((item) => {
    const startAngle = currentAngle;
    const sweepAngle = (item.value / total) * 360;
    currentAngle += sweepAngle;

    return {
      ...item,
      startAngle,
      sweepAngle,
      percentage: (item.value / total) * 100,
    };
  });

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1500 });
  }, [data]);

  return (
    <View style={styles.pieContainer}>
      <View style={styles.pieChartWrapper}>
        <Svg width={size} height={size}>
          <G>
            {slices.map((slice, index) => (
              <AnimatedPieSlice
                key={index}
                slice={slice}
                index={index}
                total={slices.length}
                progress={progress}
                center={center}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                showLabels={showLabels}
              />
            ))}
          </G>
        </Svg>

        {/* 중앙 텍스트 (도넛 차트용) */}
        {innerRadius > 0 && (
          <View style={[styles.centerLabel, { width: innerRadius * 2, height: innerRadius * 2 }]}>
            <Text style={styles.totalValue}>{total.toLocaleString()}</Text>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        )}
      </View>

      {/* 범례 */}
      {showLegend && (
        <View style={styles.legend}>
          {slices.map((slice, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
              <Text style={styles.legendLabel}>{slice.label}</Text>
              <Text style={styles.legendValue}>{slice.percentage.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function AnimatedPieSlice({
  slice,
  index,
  total,
  progress,
  center,
  outerRadius,
  innerRadius,
  showLabels,
}: {
  slice: { startAngle: number; sweepAngle: number; color: string; percentage: number };
  index: number;
  total: number;
  progress: Animated.SharedValue<number>;
  center: number;
  outerRadius: number;
  innerRadius: number;
  showLabels: boolean;
}) {
  const animatedProps = useAnimatedProps(() => {
    // 순차적 애니메이션
    const startProgress = index / total;
    const endProgress = (index + 1) / total;

    const sliceProgress = interpolate(
      progress.value,
      [startProgress, endProgress],
      [0, 1],
      'clamp'
    );

    const animatedSweep = slice.sweepAngle * sliceProgress;
    const path = createArcPath(
      center,
      center,
      outerRadius,
      innerRadius,
      slice.startAngle,
      animatedSweep
    );

    return { d: path };
  });

  // 라벨 위치 계산
  const labelAngle = slice.startAngle + slice.sweepAngle / 2;
  const labelRadius = outerRadius * 0.7;
  const labelX = center + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
  const labelY = center + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

  return (
    <>
      <AnimatedPath
        fill={slice.color}
        animatedProps={animatedProps}
      />

      {showLabels && slice.percentage > 5 && (
        <SvgText
          x={labelX}
          y={labelY}
          fill="white"
          fontSize={12}
          fontWeight="600"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {`${slice.percentage.toFixed(0)}%`}
        </SvgText>
      )}
    </>
  );
}

// 호 경로 생성 함수
function createArcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  sweepAngle: number
): string {
  'worklet';

  if (sweepAngle === 0) return '';

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = ((startAngle + sweepAngle) * Math.PI) / 180;

  const outerStartX = cx + outerRadius * Math.cos(startRad);
  const outerStartY = cy + outerRadius * Math.sin(startRad);
  const outerEndX = cx + outerRadius * Math.cos(endRad);
  const outerEndY = cy + outerRadius * Math.sin(endRad);

  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  if (innerRadius === 0) {
    // 파이 차트
    return `
      M ${cx} ${cy}
      L ${outerStartX} ${outerStartY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
      Z
    `;
  }

  // 도넛 차트
  const innerStartX = cx + innerRadius * Math.cos(startRad);
  const innerStartY = cy + innerRadius * Math.sin(startRad);
  const innerEndX = cx + innerRadius * Math.cos(endRad);
  const innerEndY = cy + innerRadius * Math.sin(endRad);

  return `
    M ${outerStartX} ${outerStartY}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
    L ${innerEndX} ${innerEndY}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
    Z
  `;
}

const styles = StyleSheet.create({
  pieContainer: {
    alignItems: 'center',
  },
  pieChartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
```

## 💻 레이더 차트 구현

```typescript
import Svg, { G, Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface RadarData {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
  levels?: number;
  color?: string;
}

export function RadarChart({
  data,
  size = 250,
  levels = 5,
  color = '#7A4AE2',
}: RadarChartProps) {
  const progress = useSharedValue(0);

  const center = size / 2;
  const radius = size / 2 - 30;
  const angleStep = (2 * Math.PI) / data.length;

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withSpring(1, { damping: 12, stiffness: 80 });
  }, [data]);

  // 그리드 포인트 계산
  const getPoint = (index: number, r: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 그리드 다각형 생성
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const levelRadius = (radius / levels) * (level + 1);
    const points = data.map((_, index) => {
      const point = getPoint(index, levelRadius);
      return `${point.x},${point.y}`;
    }).join(' ');
    return points;
  });

  // 데이터 다각형 포인트 계산
  const dataPoints = data.map((item, index) => {
    const r = (item.value / 100) * radius;
    return getPoint(index, r);
  });

  const animatedProps = useAnimatedProps(() => {
    const points = dataPoints.map(point => {
      const animatedX = center + (point.x - center) * progress.value;
      const animatedY = center + (point.y - center) * progress.value;
      return `${animatedX},${animatedY}`;
    }).join(' ');

    return { points };
  });

  return (
    <View style={[styles.radarContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* 그리드 */}
        <G>
          {gridPolygons.map((points, index) => (
            <Polygon
              key={index}
              points={points}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
        </G>

        {/* 축 */}
        <G>
          {data.map((_, index) => {
            const point = getPoint(index, radius);
            return (
              <Line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
            );
          })}
        </G>

        {/* 데이터 영역 */}
        <AnimatedPolygon
          animatedProps={animatedProps}
          fill={`${color}33`}
          stroke={color}
          strokeWidth={2}
        />

        {/* 데이터 포인트 */}
        {dataPoints.map((point, index) => (
          <AnimatedRadarPoint
            key={index}
            point={point}
            center={{ x: center, y: center }}
            progress={progress}
            color={color}
          />
        ))}

        {/* 라벨 */}
        {data.map((item, index) => {
          const labelPoint = getPoint(index, radius + 20);
          return (
            <SvgText
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              fill="#374151"
              fontSize={11}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

function AnimatedRadarPoint({
  point,
  center,
  progress,
  color,
}: {
  point: { x: number; y: number };
  center: { x: number; y: number };
  progress: Animated.SharedValue<number>;
  color: string;
}) {
  const animatedProps = useAnimatedProps(() => ({
    cx: center.x + (point.x - center.x) * progress.value,
    cy: center.y + (point.y - center.y) * progress.value,
    r: 5 * progress.value,
  }));

  return (
    <AnimatedCircle
      fill="white"
      stroke={color}
      strokeWidth={2}
      animatedProps={animatedProps}
    />
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
```

## 💻 실시간 데이터 스트리밍

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface StreamingLineChartProps {
  maxDataPoints?: number;
  updateInterval?: number;
  dataSource: () => number;
  width?: number;
  height?: number;
}

export function StreamingLineChart({
  maxDataPoints = 50,
  updateInterval = 100,
  dataSource,
  width = SCREEN_WIDTH - 40,
  height = 150,
}: StreamingLineChartProps) {
  const [data, setData] = React.useState<{ x: number; y: number }[]>([]);
  const timeRef = useRef(0);

  // 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = dataSource();

      setData(prev => {
        const newData = [...prev, { x: timeRef.current, y: newValue }];
        timeRef.current += 1;

        // 최대 데이터 포인트 수 유지
        if (newData.length > maxDataPoints) {
          return newData.slice(-maxDataPoints);
        }
        return newData;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [dataSource, updateInterval, maxDataPoints]);

  if (data.length < 2) return null;

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const rangeY = maxY - minY || 1;

  const scaleX = (index: number) =>
    padding + (index / (maxDataPoints - 1)) * chartWidth;

  const scaleY = (y: number) =>
    height - padding - ((y - minY) / rangeY) * chartHeight;

  // 부드러운 곡선 경로 생성
  const path = data
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.y);

      if (index === 0) return `M ${x} ${y}`;

      // 베지어 곡선으로 부드럽게
      const prev = data[index - 1];
      const prevX = scaleX(index - 1);
      const prevY = scaleY(prev.y);
      const cp1x = prevX + (x - prevX) * 0.5;
      const cp1y = prevY;
      const cp2x = prevX + (x - prevX) * 0.5;
      const cp2y = y;

      return `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`;
    })
    .join(' ');

  // 그라디언트 영역 경로
  const areaPath = `
    ${path}
    L ${scaleX(data.length - 1)} ${height - padding}
    L ${padding} ${height - padding}
    Z
  `;

  return (
    <View style={[styles.streamingContainer, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#7A4AE2" stopOpacity={0.3} />
            <Stop offset="100%" stopColor="#7A4AE2" stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* 영역 */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* 라인 */}
        <Path
          d={path}
          fill="none"
          stroke="#7A4AE2"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* 현재 값 포인트 */}
        {data.length > 0 && (
          <G>
            <Circle
              cx={scaleX(data.length - 1)}
              cy={scaleY(data[data.length - 1].y)}
              r={6}
              fill="#7A4AE2"
            />
            <Circle
              cx={scaleX(data.length - 1)}
              cy={scaleY(data[data.length - 1].y)}
              r={10}
              fill="#7A4AE2"
              opacity={0.3}
            />
          </G>
        )}
      </Svg>

      {/* 현재 값 표시 */}
      <View style={styles.currentValue}>
        <Text style={styles.currentValueText}>
          {data.length > 0 ? data[data.length - 1].y.toFixed(1) : '-'}
        </Text>
      </View>
    </View>
  );
}

// 사용 예
function HeartRateMonitor() {
  // 심박수 시뮬레이션
  const dataSource = useCallback(() => {
    const base = 72;
    const variation = Math.sin(Date.now() / 1000) * 5;
    const noise = (Math.random() - 0.5) * 3;
    return base + variation + noise;
  }, []);

  return (
    <View style={styles.monitorContainer}>
      <Text style={styles.monitorTitle}>Heart Rate</Text>
      <StreamingLineChart
        dataSource={dataSource}
        maxDataPoints={60}
        updateInterval={50}
      />
      <Text style={styles.monitorUnit}>BPM</Text>
    </View>
  );
}
```

## 💻 종합 대시보드 구성

```typescript
import React, { useState, useMemo } from 'react';
import { ScrollView, RefreshControl } from 'react-native';

interface DashboardData {
  revenue: { current: number; previous: number; history: { x: number; y: number }[] };
  users: { total: number; active: number; new: number };
  categories: { label: string; value: number; color: string }[];
  performance: { label: string; value: number }[];
}

export function AnalyticsDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData>(initialData);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  const onRefresh = async () => {
    setRefreshing(true);
    // 데이터 새로고침
    await fetchDashboardData(selectedPeriod);
    setRefreshing(false);
  };

  // 변화율 계산
  const revenueChange = useMemo(() => {
    const change = ((data.revenue.current - data.revenue.previous) / data.revenue.previous) * 100;
    return change;
  }, [data.revenue]);

  return (
    <ScrollView
      style={styles.dashboard}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 기간 선택 */}
      <View style={styles.periodSelector}>
        {(['day', 'week', 'month'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period && styles.periodTextActive,
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 매출 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Revenue</Text>
          <AnimatedBadge
            value={revenueChange}
            positive={revenueChange >= 0}
          />
        </View>

        <AnimatedCounter
          value={data.revenue.current}
          prefix="$"
          style={styles.bigNumber}
        />

        <InteractiveLineChart
          data={data.revenue.history}
          height={150}
          lineColor="#10B981"
        />
      </View>

      {/* 사용자 통계 */}
      <View style={styles.statsRow}>
        <StatCard
          title="Total Users"
          value={data.users.total}
          icon="users"
          color="#7A4AE2"
        />
        <StatCard
          title="Active"
          value={data.users.active}
          icon="activity"
          color="#10B981"
        />
        <StatCard
          title="New Today"
          value={data.users.new}
          icon="user-plus"
          color="#F59E0B"
        />
      </View>

      {/* 카테고리 분포 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Distribution</Text>
        <PieChart
          data={data.categories}
          size={180}
          innerRadius={50}
          showLegend
        />
      </View>

      {/* 성과 지표 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        <RadarChart
          data={data.performance}
          size={220}
        />
      </View>

      {/* 상세 바 차트 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Breakdown</Text>
        <BarChart
          data={weeklyData}
          height={180}
        />
      </View>
    </ScrollView>
  );
}

// 애니메이션 숫자 카운터
function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}) {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 1500 });
  }, [value]);

  useAnimatedReaction(
    () => animatedValue.value,
    (current) => {
      runOnJS(setDisplayValue)(Math.round(current));
    }
  );

  return (
    <Text style={style}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </Text>
  );
}

// 변화율 뱃지
function AnimatedBadge({
  value,
  positive,
}: {
  value: number;
  positive: boolean;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = 0;
    scale.value = withSpring(1, { damping: 12 });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[
      styles.badge,
      { backgroundColor: positive ? '#DEF7EC' : '#FDE8E8' },
      animatedStyle,
    ]}>
      <Text style={[
        styles.badgeText,
        { color: positive ? '#03543F' : '#9B1C1C' },
      ]}>
        {positive ? '+' : ''}{value.toFixed(1)}%
      </Text>
    </Animated.View>
  );
}

// 통계 카드
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  periodButtonActive: {
    backgroundColor: '#7A4AE2',
  },
  periodText: {
    fontSize: 14,
    color: '#6B7280',
  },
  periodTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

## 📱 sometimes-app 적용 사례

### 매칭 통계 대시보드

```typescript
// src/features/moment/ui/weekly-report/stats-dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';

interface WeeklyStats {
  matchRate: number;
  responseTime: number;
  conversationLength: number;
  compatibility: { label: string; value: number }[];
  dailyActivity: { day: string; value: number }[];
  categoryBreakdown: { label: string; value: number; color: string }[];
}

export function MatchingStatsDashboard({ stats }: { stats: WeeklyStats }) {
  return (
    <Animated.ScrollView
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      {/* 주요 지표 */}
      <View style={styles.metricsRow}>
        <AnimatedMetricCard
          title="매칭 성공률"
          value={stats.matchRate}
          suffix="%"
          color="#10B981"
          icon="heart"
          delay={0}
        />
        <AnimatedMetricCard
          title="평균 응답 시간"
          value={stats.responseTime}
          suffix="분"
          color="#7A4AE2"
          icon="clock"
          delay={100}
        />
        <AnimatedMetricCard
          title="대화 지속"
          value={stats.conversationLength}
          suffix="일"
          color="#F59E0B"
          icon="message-circle"
          delay={200}
        />
      </View>

      {/* 호환성 레이더 차트 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>나의 매력 포인트</Text>
        <RadarChart
          data={stats.compatibility}
          size={220}
          color="#7A4AE2"
        />
      </View>

      {/* 주간 활동 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>주간 활동</Text>
        <BarChart
          data={stats.dailyActivity.map(d => ({
            label: d.day,
            value: d.value,
            color: '#7A4AE2',
          }))}
          height={150}
        />
      </View>

      {/* 관심사 분포 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>매칭 유형 분석</Text>
        <PieChart
          data={stats.categoryBreakdown}
          size={180}
          innerRadius={40}
          showLegend
        />
      </View>

      {/* 성장 그래프 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>매력도 성장 추이</Text>
        <GrowthChart data={stats.growthHistory} />
      </View>
    </Animated.ScrollView>
  );
}

function AnimatedMetricCard({
  title,
  value,
  suffix,
  color,
  icon,
  delay,
}: {
  title: string;
  value: number;
  suffix: string;
  color: string;
  icon: string;
  delay: number;
}) {
  const scale = useSharedValue(0);
  const displayValue = useSharedValue(0);
  const [shownValue, setShownValue] = React.useState(0);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    displayValue.value = withDelay(
      delay + 200,
      withTiming(value, { duration: 1000 })
    );
  }, []);

  useAnimatedReaction(
    () => displayValue.value,
    (current) => {
      runOnJS(setShownValue)(Math.round(current));
    }
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[styles.metricCard, cardStyle]}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.metricValue, { color }]}>
        {shownValue}{suffix}
      </Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </Animated.View>
  );
}

// 성장 그래프 (커스텀)
function GrowthChart({ data }: { data: { week: string; score: number }[] }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
  }, []);

  const width = SCREEN_WIDTH - 64;
  const height = 120;
  const padding = 20;

  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));

  const scaleX = (index: number) =>
    padding + (index / (data.length - 1)) * (width - padding * 2);

  const scaleY = (score: number) =>
    height - padding - ((score - minScore) / (maxScore - minScore)) * (height - padding * 2);

  // 영역 그라디언트 경로
  const areaPath = useDerivedValue(() => {
    const linePart = data
      .map((point, index) => {
        const x = scaleX(index);
        const y = scaleY(point.score);
        const animatedY = scaleY(minScore) + (y - scaleY(minScore)) * progress.value;
        return index === 0 ? `M ${x} ${animatedY}` : `L ${x} ${animatedY}`;
      })
      .join(' ');

    return `${linePart} L ${scaleX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;
  });

  const animatedAreaProps = useAnimatedProps(() => ({
    d: areaPath.value,
  }));

  return (
    <View style={styles.growthChartContainer}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#7A4AE2" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#7A4AE2" stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <AnimatedPath
          fill="url(#growthGradient)"
          animatedProps={animatedAreaProps}
        />

        <AnimatedGrowthLine
          data={data}
          scaleX={scaleX}
          scaleY={scaleY}
          minScore={minScore}
          progress={progress}
        />
      </Svg>

      {/* 주차 라벨 */}
      <View style={styles.weekLabels}>
        {data.map((point, index) => (
          <Text key={index} style={styles.weekLabel}>
            {point.week}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  metricsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricTitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  growthChartContainer: {
    alignItems: 'center',
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  weekLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 데이터 스케일링 오류

```typescript
// ❌ 잘못된 방법 - 0에서 시작하지 않는 스케일링
const scaleY = (y: number) => {
  return height - (y / maxY) * height; // 최소값 무시
};

// ✅ 올바른 방법 - 데이터 범위 고려
const scaleY = (y: number) => {
  const range = maxY - minY || 1; // 0으로 나누기 방지
  return height - padding - ((y - minY) / range) * chartHeight;
};
```

### 2. 애니메이션 경쟁 상태

```typescript
// ❌ 잘못된 방법 - 데이터 변경 시 애니메이션 충돌
useEffect(() => {
  progress.value = withTiming(1, { duration: 1000 });
}, [data]);

// ✅ 올바른 방법 - 리셋 후 애니메이션
useEffect(() => {
  cancelAnimation(progress);
  progress.value = 0;
  progress.value = withTiming(1, { duration: 1000 });
}, [data]);
```

### 3. 렌더링 성능 저하

```typescript
// ❌ 잘못된 방법 - 매 렌더링마다 경로 재계산
function Chart({ data }) {
  const path = data.map(...).join(' '); // 비용이 큰 연산

  return <Path d={path} />;
}

// ✅ 올바른 방법 - 메모이제이션 활용
function Chart({ data }) {
  const path = useMemo(() => {
    return data.map(...).join(' ');
  }, [data]);

  return <Path d={path} />;
}
```

## 💡 성능 최적화 팁

### 1. 대용량 데이터 처리

```typescript
// 데이터 다운샘플링
function downsample(data: DataPoint[], targetPoints: number): DataPoint[] {
  if (data.length <= targetPoints) return data;

  const step = Math.ceil(data.length / targetPoints);
  const sampled: DataPoint[] = [];

  for (let i = 0; i < data.length; i += step) {
    // 구간 내 최대/최소값 유지 (LTTB 알고리즘 간소화)
    const slice = data.slice(i, Math.min(i + step, data.length));
    const avg = slice.reduce((sum, d) => sum + d.y, 0) / slice.length;
    sampled.push({ x: slice[Math.floor(slice.length / 2)].x, y: avg });
  }

  return sampled;
}
```

### 2. 가상화된 차트

```typescript
// 보이는 영역만 렌더링
function VirtualizedChart({
  data,
  width,
  visibleRange,
}: {
  data: DataPoint[];
  width: number;
  visibleRange: { start: number; end: number };
}) {
  const visibleData = useMemo(() => {
    return data.filter(
      (_, index) => index >= visibleRange.start && index <= visibleRange.end
    );
  }, [data, visibleRange]);

  return <LineChart data={visibleData} width={width} />;
}
```

### 3. Skia 기반 고성능 차트

```typescript
import { Canvas, Path as SkiaPath, Skia, useValue } from '@shopify/react-native-skia';

function SkiaLineChart({ data, width, height }) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();

    data.forEach((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);

      if (index === 0) {
        p.moveTo(x, y);
      } else {
        p.lineTo(x, y);
      }
    });

    return p;
  }, [data]);

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={2}
        color="#7A4AE2"
      />
    </Canvas>
  );
}
```

## 🏋️ 연습 문제

### 과제 1: 다중 라인 차트
여러 데이터셋을 하나의 차트에 표시하고, 범례와 함께 각 라인을 구분하세요.

### 과제 2: 스택 바 차트
여러 카테고리의 데이터를 쌓아서 표시하는 스택 바 차트를 구현하세요.

### 과제 3: 게이지 차트
반원형 게이지 차트로 진행률이나 점수를 표시하세요.

### 과제 4: 캔들스틱 차트
주식 데이터를 표시하는 캔들스틱 차트를 구현하세요.

## 📚 이 장에서 배운 내용

1. **데이터 시각화 기초**: 스케일링, 좌표 변환, 경로 생성
2. **차트 유형**: 라인, 바, 파이, 레이더 차트 구현
3. **인터랙션**: 터치 제스처, 툴팁, 데이터 탐색
4. **실시간 시각화**: 스트리밍 데이터, 동적 업데이트
5. **대시보드 구성**: 여러 차트를 조합한 종합 뷰

## 다음 파트 예고

**Part 6: 워크릿 심화**에서는 Reanimated의 핵심인 워크릿을 깊이 파헤칩니다. UI 스레드에서 실행되는 애니메이션의 원리를 이해하고, 복잡한 계산을 효율적으로 처리하는 방법을 배웁니다. Chapter 40부터 시작되는 이 파트는 진정한 애니메이션 전문가로 가는 관문입니다.
