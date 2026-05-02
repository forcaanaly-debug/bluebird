# Japandi Design Tokens (BlueBird)

## Principles

1. **Quiet surfaces** — warm paper tones, not pure white.
2. **One strong accent** — moss green for primary actions; deep forest for emphasis.
3. **Generous radius** — pills for navigation; 12–14px for cards.
4. **Typography** — system fonts; weight over size for hierarchy.

## Color roles

| Token | Hex | Usage |
|-------|-----|--------|
| `color.bg` | `#f4efe6` | Screen background |
| `color.surface` | `#fbf8f1` | Inputs, dropdowns |
| `color.surfaceCard` | `#f8f4ec` | Cards |
| `color.border` | `#d8ccbb` | Default borders |
| `color.ink` | `#2f463d` | Headlines, active nav |
| `color.body` | `#59695f` | Body copy |
| `color.muted` | `#6f7e73` | Labels, secondary |
| `color.accent` | `#6f8f79` | Primary buttons, user chat bubble |
| `color.accentDark` | `#2f463d` | Secondary solid buttons |
| `color.onAccent` | `#f8f4ec` | Text on accent fills |
| `color.clay` | `#e8decd` | Driver/system bubbles |

## Spacing scale

`xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32

## Implementation

Source of truth: [`src/theme/tokens.ts`](../../src/theme/tokens.ts). Import in screens:

```ts
import { color, space, radius } from "../theme";
```
