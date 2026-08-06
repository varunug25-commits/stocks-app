import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { colors } from "@/theme/tokens";

type SparklineProps = {
  points: number[];
  positive: boolean;
  width?: number;
  height?: number;
};

function buildPath(points: number[], width: number, height: number) {
  if (points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function Sparkline({ points, positive, width = 72, height = 32 }: SparklineProps) {
  const path = buildPath(points, width, height);
  const color = positive ? colors.positive : colors.negative;
  const fillPath = path ? `${path} L${width},${height} L0,${height} Z` : "";

  return (
    <Svg height={height} width={width}>
      <Defs>
        <LinearGradient id={positive ? "sparkPositive" : "sparkNegative"} x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.24" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill={`url(#${positive ? "sparkPositive" : "sparkNegative"})`} />
      <Path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} />
    </Svg>
  );
}
