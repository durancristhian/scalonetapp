import { LandingExportShowcase } from "@/components/landing-export-showcase";

export function CarouselFixture() {
  return (
    <main>
      <button>Antes del carrusel</button>
      <div style={{ maxWidth: 700 }}>
        <LandingExportShowcase />
      </div>
      <button>Después del carrusel</button>
    </main>
  );
}
