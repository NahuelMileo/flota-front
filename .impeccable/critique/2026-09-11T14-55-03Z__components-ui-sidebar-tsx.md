---
target: colores del sidebar y fondo principal
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-09-11T14-55-03Z
slug: components-ui-sidebar-tsx
---
# Dashboard shell color critique

## Verdict

The shell is readable and operationally calm, but visually generic. Its neutral token system is coherent, yet the sidebar, header, and main canvas do not form a strong hierarchy. In light mode the active navigation state nearly disappears; the transparent header also merges with page content.

## Heuristic score

| # | Heuristic | Score | Evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 3/4 | Page title and active route exist, but active navigation is weak in light mode. |
| 2 | Match with real world | 3/4 | Navigation groups reflect fleet operations; the palette and mark remain generic. |
| 3 | User control and freedom | 4/4 | Sidebar collapse and global controls remain available. |
| 4 | Consistency and standards | 4/4 | Surface roles and foregrounds are consistently tokenized. |
| 5 | Error prevention | 3/4 | Color does not introduce errors, but weak route state can cause navigation mistakes. |
| 6 | Recognition rather than recall | 2/4 | Active navigation relies mostly on font weight in light mode. |
| 7 | Flexibility and efficiency | 4/4 | Persistent sidebar and grouped routes support frequent operation. |
| 8 | Aesthetic and minimalist design | 3/4 | Restrained, but the hierarchy is so subtle that planes collapse. |
| 9 | Error recovery | 3/4 | No shell-color issue directly blocks recovery; current location could be clearer. |
| 10 | Help and documentation | 3/4 | Navigation labels are clear, though visual orientation is under-signaled. |

**Total: 32/40.**

## Strengths

- Sidebar and main surface roles are separated into semantic tokens, allowing central correction.
- Text contrast is excellent: sidebar foreground is roughly 18:1 in light mode and 17:1 in dark mode.
- The grouped navigation structure is specific to the product and reduces scanning effort.

## Priority issues

1. **P1 — Active navigation nearly disappears in light mode.** `--sidebar` and `--sidebar-accent` differ by only 0.002 OKLCH lightness, leaving font weight as the dependable cue.
2. **P1 — Header and page canvas are one undifferentiated plane.** The header has no background or bottom boundary and inherits the main background.
3. **P1 — Surface hierarchy is too weak.** Sidebar versus main contrast is approximately 1.10:1 in both themes; this is legal for decorative regions but insufficient for clear shell structure.
4. **P2 — Small muted labels miss contrast in light mode.** Muted foreground on muted background is approximately 4.34:1, below the 4.5:1 target for 12px text, affecting inactive currency labels.
5. **P2 — The neutral shell has little fleet identity.** Brand color is largely confined to charts; navigation and focus states could carry one restrained product hue.

## Persona red flags

- A dispatcher switching sections quickly may lose route orientation because the active row barely differs from the rail.
- A user in a bright environment may perceive the entire light shell as a single white-gray plane.
- Low-vision users can encounter marginal contrast in small inactive header labels.

## Minor observations

- The default sidebar variant does not apply an edge border; the available sidebar-border token is mostly unused here.
- One outlined sidebar-button style wraps an OKLCH variable in `hsl(...)`, which is invalid and should use the color variable directly.
- Dark mode has stronger internal active-state stepping than light mode, even though the sidebar/main separation remains subtle.

## Provocative questions

- Should the product feel purely neutral and accounting-like, or should fleet identity appear in active navigation and focus states?
- Is the header intended as persistent application chrome or as part of the page canvas? The current styling sits ambiguously between both.
