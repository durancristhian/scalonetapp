import Template from "@/app/(authenticated)/template";
import { AnimatedListItem } from "@/components/animated-list-item";

export function MotionFixture() {
  return (
    <Template>
      <div aria-label="Jugadores">
        {Array.from({ length: 100 }, (_, index) => (
          <AnimatedListItem key={index}>
            <button>Jugador {index + 1}</button>
          </AnimatedListItem>
        ))}
      </div>
    </Template>
  );
}
