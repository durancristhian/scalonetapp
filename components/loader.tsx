import { SoccerBall } from "@/components/soccer-ball";

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <SoccerBall className="animate-spin h-10 opacity-50 w-10" />
    </div>
  );
};
