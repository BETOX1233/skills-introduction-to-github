import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const DURATION_IN_FRAMES = 240; // 8s loopable shuffle-dance clip

const CYAN = "#2CE8FF";
const MAGENTA = "#FF3AD1";
const GOLD = "#FFD84D";

// One full stride cycle (both legs) in frames.
const STRIDE_FRAMES = 24;
const DEG = Math.PI / 180;

function rotatePoint(
  origin: { x: number; y: number },
  length: number,
  angleDeg: number,
) {
  const rad = angleDeg * DEG;
  return {
    x: origin.x + length * Math.sin(rad),
    y: origin.y + length * Math.cos(rad),
  };
}

// ---------------------------------------------------------------------------
// Shared neon glow filter (referenced by every glowing element on the page)
// ---------------------------------------------------------------------------

const NeonDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="neon-glow" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="4.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="neon-glow-soft" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

// ---------------------------------------------------------------------------
// A single neon-silhouette shuffle dancer (side profile, facing right)
// ---------------------------------------------------------------------------

type NeonDancerProps = {
  frame: number;
  xPercent: number;
  bottomPercent: number;
  scale?: number;
  color: string;
  phaseOffsetFrames?: number;
  featured?: boolean;
};

const NeonDancer: React.FC<NeonDancerProps> = ({
  frame,
  xPercent,
  bottomPercent,
  scale = 1,
  color,
  phaseOffsetFrames = 0,
  featured = false,
}) => {
  const t = frame + phaseOffsetFrames;
  const phase = (2 * Math.PI * t) / STRIDE_FRAMES;

  const thighSwing = 32;
  const armSwing = 36;

  const thighR = thighSwing * Math.sin(phase);
  const thighL = -thighSwing * Math.sin(phase);
  const shinBendR = 44 * Math.max(0, Math.sin(phase));
  const shinBendL = 44 * Math.max(0, -Math.sin(phase));

  const armL = armSwing * Math.sin(phase);
  const armR = -armSwing * Math.sin(phase);
  const elbowBendL = 18 + 18 * Math.max(0, Math.sin(phase));
  const elbowBendR = 18 + 18 * Math.max(0, -Math.sin(phase));

  const bounce = -8 * Math.abs(Math.sin(phase));
  const hipSway = 3 * Math.sin(phase);

  const hip = { x: 50 + hipSway, y: 96 };
  const shoulder = { x: 50 + hipSway * 0.6, y: 44 };

  const thighLen = 34;
  const shinLen = 34;
  const upperArmLen = 26;
  const forearmLen = 26;

  const kneeR = rotatePoint(hip, thighLen, thighR);
  const footR = rotatePoint(kneeR, shinLen, thighR + shinBendR);
  const kneeL = rotatePoint(hip, thighLen, thighL);
  const footL = rotatePoint(kneeL, shinLen, thighL + shinBendL);

  const elbowR = rotatePoint(shoulder, upperArmLen, armR);
  const handR = rotatePoint(elbowR, forearmLen, armR + elbowBendR);
  const elbowL = rotatePoint(shoulder, upperArmLen, armL);
  const handL = rotatePoint(elbowL, forearmLen, armL + elbowBendL);

  const headR = 11;
  const head = { x: shoulder.x, y: shoulder.y - 14 - headR };

  const glowWidth = featured ? 9 : 7;
  const coreWidth = featured ? 3.5 : 3;

  const Limb = ({
    points,
    width,
  }: {
    points: { x: number; y: number }[];
    width: number;
  }) => (
    <polyline
      points={points.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        bottom: `${bottomPercent}%`,
        transform: `translate(-50%, ${bounce}px) scale(${scale})`,
        width: 130,
        height: 240,
      }}
    >
      <svg viewBox="0 0 100 200" width={130} height={240}>
        <g filter="url(#neon-glow)" opacity={0.9}>
          <Limb points={[hip, kneeL, footL]} width={glowWidth} />
          <Limb points={[hip, kneeR, footR]} width={glowWidth} />
          <Limb points={[shoulder, elbowL, handL]} width={glowWidth} />
          <Limb points={[shoulder, elbowR, handR]} width={glowWidth} />
          <Limb points={[shoulder, hip]} width={glowWidth + 1} />
          <circle cx={head.x} cy={head.y} r={headR} fill={color} />
          {featured && (
            <polygon
              points={`${head.x - 10},${head.y - headR - 2} ${head.x},${
                head.y - headR - 16
              } ${head.x + 10},${head.y - headR - 2}`}
              fill={GOLD}
            />
          )}
        </g>
        <g>
          <Limb points={[hip, kneeL, footL]} width={coreWidth} />
          <Limb points={[hip, kneeR, footR]} width={coreWidth} />
          <Limb points={[shoulder, elbowL, handL]} width={coreWidth} />
          <Limb points={[shoulder, elbowR, handR]} width={coreWidth} />
          <Limb points={[shoulder, hip]} width={coreWidth} />
          <circle cx={head.x} cy={head.y} r={headR * 0.55} fill="#fff" opacity={0.85} />
        </g>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Disco ball
// ---------------------------------------------------------------------------

const DiscoBall: React.FC<{ frame: number }> = ({ frame }) => {
  const spin = (frame * 3) % 360;
  const bob = Math.sin(frame / 20) * 4;

  return (
    <div
      style={{
        position: "absolute",
        top: 30 + bob,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div
        style={{
          width: 2,
          height: 30,
          background: "#555",
          margin: "0 auto",
        }}
      />
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(255,255,255,0.5)",
          background:
            "radial-gradient(circle at 35% 30%, #fff 0%, #cfd7e0 12%, #8891a0 35%, #555c66 70%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 4px, transparent 4px 9px), repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 4px, transparent 4px 9px)",
            transform: `rotate(${spin}deg)`,
          }}
        />
      </div>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <div
          key={a}
          style={{
            position: "absolute",
            top: 45,
            left: 45,
            width: 260,
            height: 2,
            transformOrigin: "0 0",
            transform: `rotate(${a + spin * 1.5}deg)`,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.55), transparent)",
          }}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sweeping stage lights
// ---------------------------------------------------------------------------

const LightBeams: React.FC<{ frame: number }> = ({ frame }) => {
  const beams = [
    { color: CYAN, base: -40, speed: 0.9, seed: 1 },
    { color: MAGENTA, base: 40, speed: -0.8, seed: 2 },
    { color: GOLD, base: 0, speed: 0.55, seed: 3 },
  ];

  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {beams.map((b, i) => {
        const angle = b.base + Math.sin((frame + b.seed * 40) / 40) * 55 * b.speed;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              width: 0,
              height: 0,
              transformOrigin: "0 0",
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          >
            <div
              style={{
                width: 180,
                height: 720,
                marginLeft: -90,
                background: `linear-gradient(180deg, ${b.color}55, transparent 70%)`,
                clipPath: "polygon(48% 0%, 52% 0%, 100% 100%, 0% 100%)",
                opacity: 0.55,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Synthwave floor grid
// ---------------------------------------------------------------------------

const FloorGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const beat = Math.floor(frame / 12) % 2 === 0 ? CYAN : MAGENTA;
  const rows = 10;
  const scroll = (frame * 2.2) % 60;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} 260`}
      width={WIDTH}
      height={260}
      style={{ position: "absolute", bottom: 0, left: 0 }}
    >
      {Array.from({ length: rows }).map((_, i) => {
        const y = ((i * 60 + scroll) % 300) - 40;
        const spread = interpolate(y, [0, 260], [10, 640], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <line
            key={i}
            x1={WIDTH / 2 - spread}
            x2={WIDTH / 2 + spread}
            y1={y}
            y2={y}
            stroke={beat}
            strokeOpacity={interpolate(y, [0, 260], [0.05, 0.5])}
            strokeWidth={1.5}
          />
        );
      })}
      {Array.from({ length: 13 }).map((_, i) => {
        const topX = WIDTH / 2 + (i - 6) * 20;
        const bottomX = WIDTH / 2 + (i - 6) * 100;
        return (
          <line
            key={i}
            x1={topX}
            y1={0}
            x2={bottomX}
            y2={260}
            stroke={CYAN}
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Twinkling sparkles
// ---------------------------------------------------------------------------

const Sparkles: React.FC<{ frame: number; count?: number }> = ({
  frame,
  count = 26,
}) => (
  <AbsoluteFill>
    {Array.from({ length: count }).map((_, i) => {
      const x = random(`sx-${i}`) * 100;
      const y = random(`sy-${i}`) * 55;
      const period = 40 + random(`sp-${i}`) * 60;
      const offset = random(`so-${i}`) * period;
      const opacity = interpolate(
        (frame + offset) % period,
        [0, period / 2, period],
        [0.1, 0.9, 0.1],
      );
      const size = 2 + random(`ss-${i}`) * 3;
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
            background: "#fff",
            opacity,
            boxShadow: "0 0 6px 2px rgba(255,255,255,0.8)",
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Neon sign title
// ---------------------------------------------------------------------------

const NeonSign: React.FC<{ frame: number }> = ({ frame }) => {
  const intro = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });

  const flicker =
    random(`flicker-${Math.floor(frame / 5)}`) > 0.93 ? 0.4 : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        left: "50%",
        transform: `translateX(-50%) scale(${intro})`,
        textAlign: "center",
        fontFamily:
          "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        opacity: intro * flicker,
      }}
    >
      <div
        style={{
          fontSize: 54,
          fontWeight: 800,
          letterSpacing: 6,
          color: "#fff",
          textShadow: `0 0 6px #fff, 0 0 18px ${MAGENTA}, 0 0 36px ${MAGENTA}, 0 0 60px ${MAGENTA}`,
        }}
      >
        DISCOTECA
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 10,
          color: "#fff",
          textShadow: `0 0 4px #fff, 0 0 12px ${CYAN}, 0 0 26px ${CYAN}`,
        }}
      >
        SHUFFLE DANCE NIGHT
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export const DiscoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05]);

  const crowdCount = 6;
  const crowdXs = Array.from(
    { length: crowdCount },
    (_, i) => 14 + (i * 72) / (crowdCount - 1),
  );

  return (
    <AbsoluteFill style={{ background: "#0a0616", overflow: "hidden" }}>
      <NeonDefs />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 15%, #2a0f4a 0%, #170a2e 45%, #08040f 100%)",
        }}
      />

      <LightBeams frame={frame} />
      <Sparkles frame={frame} />
      <DiscoBall frame={frame} />
      <NeonSign frame={frame} />

      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <FloorGrid frame={frame} />

        {/* Spotlight behind the featured dancer */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            width: 360,
            height: 460,
            transform: "translateX(-50%)",
            background: `radial-gradient(ellipse at 50% 100%, ${MAGENTA}33 0%, transparent 65%)`,
          }}
        />

        {crowdXs.map((x, i) => (
          <NeonDancer
            key={i}
            frame={frame}
            xPercent={x}
            bottomPercent={4}
            scale={0.72}
            color={CYAN}
          />
        ))}

        <NeonDancer
          frame={frame}
          xPercent={50}
          bottomPercent={2}
          scale={1.05}
          color={MAGENTA}
          featured
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Composition registration
// ---------------------------------------------------------------------------

export const DiscoComposition: React.FC = () => (
  <Composition
    id="Disco"
    component={DiscoScene}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
