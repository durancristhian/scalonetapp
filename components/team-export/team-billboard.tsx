import { type ImageExportBackgroundId } from "@/utils/image-export-backgrounds";
import { cn } from "@/utils/cn";

// Material textures stay local to the export artwork and use its selected palette.
const materials = {
  pasto: {
    panel: cn(
      "border-[color-mix(in_oklch,var(--export-divider-color)_75%,white)]",
      "[background:linear-gradient(180deg,color-mix(in_oklch,var(--export-frame-color)_75%,var(--export-divider-color)),var(--export-frame-color)_22%,var(--export-frame-color)_80%,color-mix(in_oklch,var(--export-frame-color)_85%,var(--export-divider-color)))]",
      "shadow-[inset_0_2px_0_oklch(1_0_none/14%),0_5px_0_color-mix(in_oklch,var(--export-frame-color)_75%,black),0_13px_12px_oklch(0_0_none/20%)]",
    ),
    support: "",
    fastener:
      "size-1.5 shadow-[0_0_0_1px_oklch(0_0_none/35%),inset_0_1px_0_oklch(1_0_none/50%)]",
  },
  natural: {
    panel: cn(
      "rounded-sm border-[color-mix(in_oklch,var(--export-divider-color)_65%,var(--export-frame-color))]",
      "shadow-[inset_0_1px_0_oklch(1_0_none/12%),0_4px_0_var(--export-frame-color),0_12px_10px_oklch(0_0_none/20%)]",
      "before:pointer-events-none",
      "before:absolute",
      "before:inset-1",
      "before:opacity-20",
      "before:[background:repeating-linear-gradient(176deg,transparent_0_26px,var(--export-divider-color)_26px_27px,transparent_27px_61px),radial-gradient(ellipse_at_5%_15%,var(--export-divider-color),transparent_30%)]",
    ),
    support: "",
    fastener: "",
  },
  potrero: {
    panel: cn(
      "rounded-none border-[color-mix(in_oklch,var(--export-frame-color)_80%,var(--export-divider-color))]",
      "[background:repeating-linear-gradient(0deg,transparent_0_23px,oklch(0_0_none/32%)_23px_26px,oklch(1_0_none/5%)_26px_27px,transparent_27px_51px),linear-gradient(175deg,color-mix(in_oklch,var(--export-frame-color)_70%,var(--export-divider-color)),var(--export-frame-color))]",
      "shadow-[1px_5px_0_color-mix(in_oklch,var(--export-frame-color)_75%,black),0_12px_10px_oklch(0_0_none/25%)]",
      "before:pointer-events-none",
      "before:absolute",
      "before:inset-1",
      "before:opacity-10",
      "before:[background:repeating-linear-gradient(177deg,transparent_0_7px,var(--export-divider-color)_7px_8px,transparent_8px_18px),repeating-radial-gradient(ellipse_at_18%_40%,transparent_0_12px,var(--export-divider-color)_13px_14px,transparent_15px_24px)]",
    ),
    support: "[inset-inline:theme(spacing.9)_theme(spacing.7)] -skew-x-1",
    fastener:
      "bg-[color-mix(in_oklch,var(--export-divider-color)_50%,var(--export-frame-color))] shadow-[0_1px_0_oklch(0_0_none/50%)]",
  },
} satisfies Record<
  ImageExportBackgroundId,
  { panel: string; support: string; fastener: string }
>;

export function TeamBillboard({
  id,
  name,
  background,
}: {
  id: string;
  name: string;
  background: ImageExportBackgroundId;
}) {
  const material = materials[background];
  const fastener = cn(
    "relative size-1 flex-none rounded-full bg-[var(--export-divider-color)] opacity-80",
    material.fastener,
  );
  return (
    <div
      className="relative isolate mx-6 my-2 min-w-0 [margin-block-end:theme(spacing.3)] [padding-block-end:theme(spacing.3)]"
      data-team-billboard
    >
      <span
        className={cn(
          "absolute -z-10 [inset-inline:theme(spacing.8)] [inset-block:theme(spacing.3)_0] border-s-8 border-e-8 border-[color-mix(in_oklch,var(--export-frame-color)_85%,black)]",
          material.support,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative flex min-h-20 items-center gap-4 rounded-sm border-2 border-[var(--export-divider-color)] p-4 text-white [background:linear-gradient(175deg,color-mix(in_oklch,var(--export-frame-color)_78%,var(--export-divider-color)),var(--export-frame-color)_65%)]",
          material.panel,
        )}
      >
        <span className={fastener} aria-hidden="true" />
        <h2
          className="relative min-w-0 flex-1 truncate text-center text-3xl font-bold leading-tight"
          id={id}
          title={name}
        >
          {name}
        </h2>
        <span className={fastener} aria-hidden="true" />
      </div>
    </div>
  );
}
