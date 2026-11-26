import React, { useId } from 'react';

interface SparklineProps {
  data: number[];
  positive: boolean;
  height?: number;
  interactive?: boolean;
  onHoverPoint?: (value: number | null, index: number | null) => void;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  positive,
  height = 28,
  interactive = false,
  onHoverPoint,
}) => {
  const gradId = useId();
  const safeData = data.length >= 2 ? data : [0, 0];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;

  const width = 100;
  const padTop = 3;
  const padBottom = 3;
  const drawHeight = height - padTop - padBottom;

  const points = safeData.map((val, idx) => {
    const x = (idx / (safeData.length - 1)) * width;
    const y = padTop + drawHeight - ((val - min) / range) * drawHeight;
    return { x, y, val };
  });

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const strokeColor = positive ? '#089981' : '#f23645';

  return (
    <svg
      className="w-full h-full overflow-visible select-none"
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
      onMouseLeave={() => onHoverPoint?.(null, null)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {interactive &&
        points.map((pt, idx) => (
          <rect
            key={idx}
            x={Math.max(0, pt.x - width / safeData.length / 2)}
            y={0}
            width={width / safeData.length}
            height={height}
            fill="transparent"
            onMouseEnter={() => onHoverPoint?.(pt.val, idx)}
          />
        ))}
    </svg>
  );
};
