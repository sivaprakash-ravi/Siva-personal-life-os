# SIVA OS — Hero carousel

The Home hero carousel is **fully data/config driven**. It shows **two**
branded slides — **Personal** (“Discipline today.”) and **Spiritual**
("Rise. Focus. Conquer.") — over an elegant tonal placeholder until you add
your own images.

All content lives in one place: `src/constants/hero.ts`.

---

## How to customize the SIVA OS Hero

### 1. Change the brand (name / tagline)

Centralised in `src/constants/brand.ts`:

```ts
export const BRAND = {
  name: 'SIVA OS',
  tagline: 'Build a Better Me',
  ...
}
```

Change these once and every place that shows the brand (the Home `BrandHeader`
and the hero chip) updates automatically. The brand color treatment (electric
blue + cyan + violet) is also centralised under `BRAND.colors`.

### 2. Change slide copy (title / subtitle / caption / eyebrow)

Edit `src/constants/hero.ts` — each slide is a plain object:

```ts
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'personal',
    tone: 'info',        // picks the accent colour (info/success/warning/danger/violet)
    eyebrow: 'DAILY · MINDFULNESS',
    title: 'Discipline today.',
    subtitle: 'A better tomorrow.',
    caption: 'Mind · Body · Purpose',
    glyph: '✦',          // faint watermark on the image-less placeholder
    // image: require('../../../assets/dashboard/hero/personal/personal.jpg'),
  },
  { id: 'spiritual', tone: 'violet', ... },
]
```

- `id` must be unique.
- `tone` controls the accent colour. Use `violet` for the spiritual slide.
- Remove any field to hide it (all are optional).
- To reorder or remove slides, just edit this array.
- To add more slides, append another object — the carousel, dots and arrows
  adapt automatically.

### 3. Add a real image

1. Drop your file into this folder:
   - `assets/dashboard/hero/personal/…` for the personal slide
   - `assets/dashboard/hero/spiritual/…` for the spiritual slide
2. Uncomment / add an `image` entry pointing at the asset (use `require`, not
   a remote URL — **no network images**):
   ```ts
   // eslint-disable-next-line @typescript-eslint/no-require-imports
   image: require('../../../assets/dashboard/hero/personal/personal.jpg'),
   ```

Until an image is present, the slide renders an elegant tonal placeholder — you
can safely delete the `image` line at any time.

### 4. Change the auto-scroll speed

One constant in `src/constants/hero.ts`:

```ts
export const HERO_AUTO_SCROLL_INTERVAL_MS = 5600; // ms between slides
```

---

## Component files

| File | Purpose |
| --- | --- |
| `src/constants/brand.ts` | Central SIVA OS brand identity + colors |
| `src/constants/hero.ts` | Central hero slides config + auto-scroll interval |
| `src/components/dashboard/hero-carousel.tsx` | Config-driven carousel (renders config; no hardcoded copy) |
| `src/components/brand/logo-mark.tsx` | SIVA OS lightning brand mark |
| `src/components/brand/brand-header.tsx` | Slim SIVA OS identity strip |

No component code needs to change for content edits — this README’s examples
are the only thing you normally touch.
