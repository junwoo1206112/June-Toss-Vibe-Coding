interface SkeletonProps {
  height?: number;
  width?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ height = 20, width = "100%", style }: SkeletonProps) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: "6px",
        background: "linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}
