import "./index.css";
import { MyComposition } from "./Composition";
import { DiscoComposition } from "./Disco";
import { FamilyComposition } from "./Family";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <DiscoComposition />
      <FamilyComposition />
    </>
  );
};
