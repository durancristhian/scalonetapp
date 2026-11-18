import { SoccerBall } from "@/components/soccer-ball";

export const Loader = () => {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 items-center justify-center min-h-dvh w-full"
    >
      <SoccerBall
        aria-hidden="true"
        className="animate-spin motion-reduce:[animation-duration:6s] h-10 opacity-50 w-10"
      />
      <p className="text-sm text-muted-foreground">Cargando…</p>
    </div>
  );
};
