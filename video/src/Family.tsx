import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { rotatePoint } from "./lib/geometry";
import { Sparkles } from "./lib/Sparkles";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const DURATION_IN_FRAMES = 240; // 8s loopable clip

const GOLD = "#F4C542";
const SKIN = "#F2B98A";
const DARK = "#3B2A21";

const HORIZON_PCT = 42;
const POOL_BOTTOM_PCT = 72;

// ---------------------------------------------------------------------------
// A cute front-facing "icon" family member
// ---------------------------------------------------------------------------

type Accessory = "sunglasses" | "hat" | "floatie" | "pigtails" | "none";

type IconPersonProps = {
  frame: number;
  xPercent: number;
  bottomPercent: number;
  scale?: number;
  outfit: string;
  hair: string;
  accessory?: Accessory;
  phaseOffset?: number;
  energetic?: boolean;
};

const IconPerson: React.FC<IconPersonProps> = ({
  frame,
  xPercent,
  bottomPercent,
  scale = 1,
  outfit,
  hair,
  accessory = "none",
  phaseOffset = 0,
  energetic = false,
}) => {
  const t = frame + phaseOffset;
  const cycle = energetic ? 16 : 26;
  const phase = (2 * Math.PI * t) / cycle;

  const bounceAmp = energetic ? 9 : 3;
  const bounce = -Math.abs(Math.sin(phase)) * bounceAmp;

  const waveAmp = energetic ? 26 : 15;
  const rightArmAngle = 158 + waveAmp * Math.sin(phase * (energetic ? 1.4 : 1));
  const leftArmAngle = energetic
    ? 150 + waveAmp * Math.sin(phase * 1.4 + Math.PI)
    : 32 + 5 * Math.sin(phase * 0.5);

  const head = { x: 50, y: 30 };
  const headR = 22;
  const leftShoulder = { x: 36, y: 58 };
  const rightShoulder = { x: 64, y: 58 };
  const armLen = 50;

  const rightHand = rotatePoint(rightShoulder, armLen, rightArmAngle);
  const leftHandRaw = rotatePoint(leftShoulder, armLen, leftArmAngle);
  // Mirror the left arm so it swings toward -x instead of +x.
  const leftHand = {
    x: leftShoulder.x - (leftHandRaw.x - leftShoulder.x),
    y: leftHandRaw.y,
  };

  const leftHip = { x: 40, y: 118 };
  const rightHip = { x: 60, y: 118 };
  const footY = 165;

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
        {accessory === "floatie" && (
          <circle
            cx={50}
            cy={92}
            r={30}
            fill="none"
            stroke="#FF6F91"
            strokeWidth={12}
            opacity={0.95}
          />
        )}

        {/* legs */}
        <rect x={leftHip.x - 6} y={leftHip.y} width={12} height={47} rx={6} fill={outfit} />
        <rect x={rightHip.x - 6} y={rightHip.y} width={12} height={47} rx={6} fill={outfit} />
        <ellipse cx={leftHip.x} cy={footY} rx={9} ry={5} fill={SKIN} />
        <ellipse cx={rightHip.x} cy={footY} rx={9} ry={5} fill={SKIN} />

        {/* arms (behind body) */}
        <line
          x1={leftShoulder.x}
          y1={leftShoulder.y}
          x2={leftHand.x}
          y2={leftHand.y}
          stroke={SKIN}
          strokeWidth={13}
          strokeLinecap="round"
        />
        <line
          x1={rightShoulder.x}
          y1={rightShoulder.y}
          x2={rightHand.x}
          y2={rightHand.y}
          stroke={SKIN}
          strokeWidth={13}
          strokeLinecap="round"
        />
        <circle cx={leftHand.x} cy={leftHand.y} r={9} fill={SKIN} />
        <circle cx={rightHand.x} cy={rightHand.y} r={9} fill={SKIN} />

        {/* body */}
        <rect x={32} y={50} width={36} height={70} rx={18} fill={outfit} />

        {/* head + face */}
        <circle cx={head.x} cy={head.y} r={headR} fill={SKIN} />
        <circle cx={43} cy={26} r={5} fill="#fff" opacity={0.9} />
        <circle cx={57} cy={26} r={5} fill="#fff" opacity={0.9} />
        <circle cx={43.5} cy={27} r={2.6} fill={DARK} />
        <circle cx={57.5} cy={27} r={2.6} fill={DARK} />
        <circle cx={36} cy={33} r={5} fill="#FF9AA8" opacity={0.5} />
        <circle cx={64} cy={33} r={5} fill="#FF9AA8" opacity={0.5} />
        <path
          d="M 40,35 Q 50,45 60,35"
          stroke={DARK}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />

        {accessory === "sunglasses" && (
          <g>
            <rect x={36} y={22} width={28} height={9} rx={4.5} fill="#2B2B2B" />
            <rect x={39} y={23.5} width={9} height={3} rx={1.5} fill="#fff" opacity={0.5} />
          </g>
        )}

        {hair === "short" && (
          <path
            d="M 28,22 A 22,22 0 0 1 72,22 L 70,10 A 24,16 0 0 0 30,10 Z"
            fill={DARK}
          />
        )}
        {hair === "tuft" && (
          <g fill={DARK}>
            <polygon points="42,10 48,-2 52,10" />
            <polygon points="50,8 56,-4 60,9" />
            <polygon points="34,12 40,1 44,12" />
          </g>
        )}
        {accessory === "pigtails" && (
          <g fill={DARK}>
            <circle cx={24} cy={22} r={8} />
            <circle cx={76} cy={22} r={8} />
            <polygon points="20,16 28,16 24,8" fill={GOLD} />
            <polygon points="72,16 80,16 76,8" fill={GOLD} />
          </g>
        )}
        {accessory === "hat" && (
          <g>
            <ellipse cx={50} cy={13} rx={42} ry={11} fill="#F5E1C8" />
            <ellipse cx={50} cy={3} rx={19} ry={13} fill="#F5E1C8" />
            <rect x={33} y={11} width={34} height={4} fill={GOLD} />
            <ellipse cx={22} cy={30} rx={6} ry={9} fill={hair} />
            <ellipse cx={78} cy={30} rx={6} ry={9} fill={hair} />
          </g>
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sunset sky + sun
// ---------------------------------------------------------------------------

const SkyAndSun: React.FC<{ frame: number }> = ({ frame }) => {
  const glowPulse = 1 + 0.04 * Math.sin(frame / 25);
  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #2B1055 0%, #6A2C70 28%, #F0537A 55%, #FF9A56 ${HORIZON_PCT}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${HORIZON_PCT - 9}%`,
          width: 130,
          height: 130,
          borderRadius: "50%",
          transform: `translate(-50%, -50%) scale(${glowPulse})`,
          background:
            "radial-gradient(circle, #FFF3C4 0%, #FFD36E 40%, rgba(255,180,80,0) 70%)",
          boxShadow: "0 0 90px 40px rgba(255, 200, 120, 0.35)",
        }}
      />
    </>
  );
};

const Skyline: React.FC = () => {
  const buildings = [
    { x: 40, w: 40, h: 30 },
    { x: 90, w: 60, h: 55 },
    { x: 160, w: 45, h: 25 },
    { x: 980, w: 55, h: 40 },
    { x: 1050, w: 40, h: 65 },
    { x: 1110, w: 60, h: 30 },
  ];
  return (
    <svg
      width={WIDTH}
      height={80}
      viewBox={`0 0 ${WIDTH} 80`}
      style={{
        position: "absolute",
        top: `${HORIZON_PCT}%`,
        left: 0,
        transform: "translateY(-100%)",
      }}
    >
      {buildings.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={80 - b.h}
          width={b.w}
          height={b.h}
          fill="#5B3B73"
          opacity={0.45}
        />
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Infinity pool
// ---------------------------------------------------------------------------

const Pool: React.FC<{ frame: number }> = ({ frame }) => {
  const poolHeightPct = POOL_BOTTOM_PCT - HORIZON_PCT;
  const shimmerX = (frame * 1.6) % 200;

  return (
    <div
      style={{
        position: "absolute",
        top: `${HORIZON_PCT}%`,
        left: 0,
        width: "100%",
        height: `${poolHeightPct}%`,
        overflow: "hidden",
        background: "linear-gradient(180deg, #E8895A 0%, #2E7C8C 35%, #145169 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: -200 + shimmerX,
          width: "140%",
          height: "100%",
          background:
            "repeating-linear-gradient(100deg, rgba(255,255,255,0.16) 0 8px, transparent 8px 60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 4,
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 0 12px 3px rgba(255,255,255,0.7)",
        }}
      />
    </div>
  );
};

const Deck: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: `${POOL_BOTTOM_PCT}%`,
      left: 0,
      width: "100%",
      height: `${100 - POOL_BOTTOM_PCT}%`,
      background: "#E4C9A0",
      backgroundImage:
        "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 64px), repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 64px)",
    }}
  />
);

// ---------------------------------------------------------------------------
// Palm tree, lounge chair + umbrella props
// ---------------------------------------------------------------------------

const PalmTree: React.FC<{ frame: number }> = ({ frame }) => {
  const sway = 4 * Math.sin(frame / 30);
  return (
    <div
      style={{
        position: "absolute",
        left: "6%",
        bottom: "18%",
        width: 90,
        height: 260,
        transformOrigin: "bottom center",
        transform: `rotate(${sway * 0.3}deg)`,
      }}
    >
      <svg width={90} height={260} viewBox="0 0 90 260">
        <rect x={40} y={90} width={10} height={170} rx={5} fill="#7A5230" />
        <g transform={`rotate(${sway}, 45, 90)`} fill="#2E7D4F">
          <ellipse cx={45} cy={90} rx={55} ry={16} transform="rotate(-20 45 90)" />
          <ellipse cx={45} cy={90} rx={55} ry={16} transform="rotate(20 45 90)" />
          <ellipse cx={45} cy={90} rx={50} ry={14} transform="rotate(60 45 90)" />
          <ellipse cx={45} cy={90} rx={50} ry={14} transform="rotate(-60 45 90)" />
          <ellipse cx={45} cy={90} rx={40} ry={12} transform="rotate(0 45 90)" />
        </g>
      </svg>
    </div>
  );
};

const LoungeSetup: React.FC = () => (
  <svg
    width={260}
    height={140}
    viewBox="0 0 260 140"
    style={{ position: "absolute", right: "6%", bottom: "6%" }}
  >
    <line x1={40} y1={0} x2={40} y2={60} stroke="#B5493A" strokeWidth={6} />
    <polygon points="0,60 80,60 65,10 15,10" fill="#F26B4D" opacity={0.9} />
    <rect x={0} y={95} width={90} height={12} rx={6} fill="#fff" />
    <rect x={5} y={80} width={80} height={20} rx={8} fill="#fff" opacity={0.85} />
    <line x1={0} y1={107} x2={0} y2={130} stroke="#7A5230" strokeWidth={5} />
    <line x1={90} y1={107} x2={90} y2={130} stroke="#7A5230" strokeWidth={5} />
    <circle cx={140} cy={110} r={22} fill="#D9B27C" />
    <circle cx={140} cy={110} r={22} fill="none" stroke="#B5493A" strokeWidth={3} />
    <line x1={140} y1={70} x2={140} y2={88} stroke="#7A5230" strokeWidth={5} />
    <circle cx={132} cy={100} r={8} fill="#FFD84D" />
    <circle cx={150} cy={100} r={7} fill="#FF6F91" />
    <rect x={125} y={112} width={30} height={6} rx={3} fill="#F26B4D" />
  </svg>
);

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const intro = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        left: "50%",
        transform: `translateX(-50%) scale(${intro})`,
        textAlign: "center",
        opacity: intro,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 4,
          color: "#FFF8E7",
          textShadow: `0 0 10px ${GOLD}, 0 0 24px ${GOLD}, 0 2px 6px rgba(0,0,0,0.4)`,
        }}
      >
        Familia Feliz
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: 20,
          letterSpacing: 8,
          color: GOLD,
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
        }}
      >
        VIDA DE LUJO
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export const FamilyScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <SkyAndSun frame={frame} />
      <Skyline />
      <Pool frame={frame} />
      <Deck />

      <PalmTree frame={frame} />
      <LoungeSetup />

      <Sparkles frame={frame} color={GOLD} count={20} topPercent={45} seedPrefix="gold" />

      <IconPerson
        frame={frame}
        xPercent={38}
        bottomPercent={9}
        scale={0.62}
        outfit="#3DDC97"
        hair={DARK}
        accessory="pigtails"
        phaseOffset={4}
        energetic
      />
      <IconPerson
        frame={frame}
        xPercent={46.5}
        bottomPercent={9}
        scale={1.05}
        outfit="#FF6F91"
        hair="#7A5230"
        accessory="hat"
        phaseOffset={0}
      />
      <IconPerson
        frame={frame}
        xPercent={57.5}
        bottomPercent={9}
        scale={1.1}
        outfit="#1F3B57"
        hair="short"
        accessory="sunglasses"
        phaseOffset={9}
      />
      <IconPerson
        frame={frame}
        xPercent={67}
        bottomPercent={9}
        scale={0.78}
        outfit="#FFD23F"
        hair="tuft"
        accessory="floatie"
        phaseOffset={13}
        energetic
      />

      <Title frame={frame} />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Composition registration
// ---------------------------------------------------------------------------

export const FamilyComposition: React.FC = () => (
  <Composition
    id="Family"
    component={FamilyScene}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
