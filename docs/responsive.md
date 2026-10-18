# Responsive contract

Adopted on 2026-10-18 for new and already-running UI tasks. This document defines acceptance; it does not install or enforce automated checks.

Before continuing an existing UI task, compare its evidence against this contract. Keep valid checks tied to their tested revision; complete missing applicable checks before final review. Record pre-existing failures separately from regressions. The contract does not authorize unrelated redesigns or copy changes. Non-UI tasks record why layout checks are not applicable.

## Support and layout

Support the application from 320 CSS pixels of viewport width upward, including widths between test samples. Below 320px is outside routine responsive acceptance unless a task explicitly calls for it. Do not add a body min-width, block narrow users, disable zoom, or hide document overflow to satisfy the matrix.

Use three design ranges:

| Range | CSS viewport width | Baseline test viewport |
| --- | --- | --- |
| Compact | 320 <= width < 768 | 320 x 568 |
| Intermediate | 768 <= width < 1280 | 768 x 1024 |
| Wide | width >= 1280 | 1280 x 800 |

The minimum applies to the page viewport, not individual cards, columns or dialogs. Components must fit their available parent space. Keep content at a useful maximum width on large screens.

Preserve Tailwind defaults: sm=640, md=768, lg=1024, xl=1280, 2xl=1536. Use base styles for narrow widths. Add a breakpoint only when content needs a different arrangement. Existing 480px footer and 640px dialog transitions remain valid component-specific rules. Three product ranges do not mean exactly three CSS breakpoints or three distinct versions of every component.

## Verification for UI changes

1. Check the affected journey at all three baseline viewports and at 1024 x 768. Use synthetic data in a verified local or Preview environment. This policy does not authorize Production data creation or workflow execution.
2. For a broad responsive change or release, also check 390 x 844 and 1440 x 900 to cover a wider compact sample and behavior above the content cap. When height-sensitive UI changes, also check a short landscape viewport such as 844 x 390 and dialog/footer reachability with the on-screen keyboard where available. These are test samples, not device-market-share claims.
3. For each breakpoint used by the changed component, inspect immediately below, at, and above it. Examples: 767/768/769 for navigation, 479/480/481 for the footer, and 639/640/641 for dialogs. Check 1023/1024/1025 or 1279/1280/1281 when relevant layout rules actually change there. Do not rerun every boundary for unrelated changes.
4. Confirm no unintended page-level horizontal scrolling, clipped content, unreachable actions or overlapping controls. Test long names, wrapping, relevant empty/error/busy states, and keyboard access. Preserve access to actions when labels or placement change. Fix overflow at its source rather than concealing it.
5. Check reflow at 320 CSS pixels and browser zoom separately when layout or viewport settings change. A narrow screenshot alone does not prove zoom or accessibility compliance. Record any current zoom restriction as a failure or limitation, not a pass.
6. Record revision, browser, viewport width and height in CSS pixels, relevant DPR/zoom, environment, journey/state, and outcome. Distinguish source inspection, browser emulation and actual-device verification. Only mark checks passed when executed; explain any skipped check.

Image-export canvas dimensions and pixel density are separate output requirements. Keep their tests independent from this application viewport matrix. Component/container tests may legitimately use widths below 320 when the component receives that space in a supported page.

Reference: [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
