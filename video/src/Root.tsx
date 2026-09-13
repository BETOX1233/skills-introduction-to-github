import "./index.css";
import { MyComposition } from "./Composition";
import { DiscoComposition } from "./Disco";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <DiscoComposition />
    </>
  );
};
