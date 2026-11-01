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
- Tailwind 4 requires Safari 16.4+, Chrome 111+ or Firefox 128+; older browsers are outside the supported floor. See the [official upgrade guide](https://tailwindcss.com/docs/upgrade-guide#browser-requirements).
- Reuse [components/ui](components/ui) controls and Lucide icons.
- Primary buttons use `primary` roles; secondary actions use existing outline/ghost variants.
- Preserve visible focus, disabled/busy feedback and reachable actions. Standard buttons are 48px high; compact controls retain usable touch targets.
- Keyboard focus uses the shared `:focus-visible` rule in [app/globals.css](app/globals.css): a 2px solid outline, 2px offset and the theme's `ring` color. Do not add component-specific focus rings, border changes or outline suppression. Native links and controls inherit this rule too. Vendor styles load in the `vendor` layer below the shared `focus` layer.
- Menu items and select options keep the same outline inset by 2px so scrolling containers cannot clip it. Keep selected/hover backgrounds separate from focus. Forced colors uses `CanvasText`; retain a real outline rather than a box shadow.
- This treatment follows [WCAG focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Check keyboard focus, contrast and clipping in both themes and forced colors when changing controls.
- Fix overflow at its source. Preserve zoom and content access.

## Motion

- Keep feedback brief and functional. Honor reduced motion when adding or changing animations.

## Exports

- [components/team-export](components/team-export) owns the stadium composition and export-specific styles.
- [utils/image-export-backgrounds.ts](utils/image-export-backgrounds.ts) owns selectable background palettes.
- Keep application chrome neutral; stadium colors belong to the exported composition.
- Preserve preview/capture agreement and follow the download encoding contract in [AGENTS.md](AGENTS.md#product-contracts).
