import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";

type SparklesProps = {
  frame: number;
  count?: number;
  color?: string;
  seedPrefix?: string;
  topPercent?: number;
};

export const Sparkles: React.FC<SparklesProps> = ({
  frame,
  count = 26,
  color = "#fff",
  seedPrefix = "s",
  topPercent = 55,
}) => (
  <AbsoluteFill>
    {Array.from({ length: count }).map((_, i) => {
      const x = random(`${seedPrefix}-x-${i}`) * 100;
      const y = random(`${seedPrefix}-y-${i}`) * topPercent;
      const period = 40 + random(`${seedPrefix}-p-${i}`) * 60;
      const offset = random(`${seedPrefix}-o-${i}`) * period;
      const opacity = interpolate(
        (frame + offset) % period,
        [0, period / 2, period],
        [0.1, 0.9, 0.1],
      );
      const size = 2 + random(`${seedPrefix}-s-${i}`) * 3;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            opacity,
            boxShadow: `0 0 6px 2px ${color}`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);
