# Design: Scalonetapp

The current system, documented from source. Future UI work shares it; change its direction deliberately.

## System

- Genre: modern-minimal application with football imagery in exports.
- Shape: match dashboard, roster editor and two-team builder.
- Theme: existing custom system; neutral application shell and configurable stadium exports.
- Language: Spanish product copy, short labels and direct actions.

## Tokens and typography

- [app/globals.css](app/globals.css) owns semantic HSL colors, light/dark definitions and the radius token.
- [tailwind.config.ts](tailwind.config.ts) maps those tokens to utilities. Reuse their roles instead of adding parallel palettes.
- [utils/fonts.ts](utils/fonts.ts) owns Work Sans. Body text uses the existing 16px/24px baseline.
- Keep the white/stone shell, restrained borders, dark primary actions and clear destructive states.
- Shared radius starts at 0.5rem; use the existing `lg`, `md` and `sm` mappings.

## Layout and controls

- Support page widths from 320 CSS pixels upward. Let components fit their available space.
- Reuse the centered `max-w-7xl` shell and existing spacing scale where applicable.
- Preserve Tailwind breakpoints; change arrangement when content needs it.
- Reuse [components/ui](components/ui) controls and Lucide icons.
- Primary buttons use `primary` roles; secondary actions use existing outline/ghost variants.
- Preserve visible focus, disabled/busy feedback and reachable actions. Standard buttons are 48px high; compact controls retain usable touch targets.
- Fix overflow at its source. Preserve zoom and content access.

## Motion

- Keep feedback brief and functional. Honor reduced motion when adding or changing animations.

## Exports

- [components/team-export](components/team-export) owns the stadium composition and export-specific styles.
- [utils/image-export-backgrounds.ts](utils/image-export-backgrounds.ts) owns selectable background palettes.
- Keep application chrome neutral; stadium colors belong to the exported composition.
- Preserve preview/PNG agreement and output dimensions under [AGENTS.md](AGENTS.md#product-contracts).
