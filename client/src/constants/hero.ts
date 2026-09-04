/**
 * SIVA OS hero carousel configuration.
 *
 * Single source of truth for the Home hero. The carousel component
 * (`HeroCarousel`) is a pure renderer — every image and text value below can
 * be edited here without touching any UI component.
 *
 * EXACTLY two slides are expected:
 *   Slide 1 — personal black-dress portrait  (electric blue/cyan treatment)
 *   Slide 2 — family beach photo              (warm violet treatment)
 */
import type { HeroSlide } from '@/components/dashboard/hero-carousel';
import { BRAND } from '@/constants/brand';

/** Auto-advance interval in ms (5-6s feel). */
export const HERO_AUTO_SCROLL_INTERVAL_MS = 5600;

/** Branding shown inside every hero slide. */
export const HERO_BRAND = {
  name: BRAND.name,
  tagline: BRAND.tagline,
};

/**
 * The two SIVA OS hero slides.
 * Change any `imageWeb`/`imageMobile`/`image`, `eyebrow`, `title`, `subtitle`,
 * `caption`, `tone` or the ordering here and the carousel follows automatically.
 *
 * Platform asset selection (see HeroCarousel):
 *   Web      -> `imageWeb`
 *   Android/iOS -> `imageMobile` (falls back to `image`)
 * `image` is the shared/generic fallback. To use dedicated mobile art later,
 * drop a 1080x600 file into `assets/dashboard/hero/` and set `imageMobile`.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'personal',
    tone: 'info',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    imageWeb: require('../../assets/dashboard/hero/personal-black-dress.png'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    imageMobile: require('../../assets/dashboard/hero/personal-black-dress-mobile.png'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require('../../assets/dashboard/hero/personal-black-dress.png'),
    eyebrow: 'SIVA OS',
    title: 'Build a Better Me',
    subtitle: 'Become the person you choose to be.',
    caption: 'Mind · Body · Discipline · Freedom',
  },
  {
    id: 'family',
    tone: 'violet',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    imageWeb: require('../../assets/dashboard/hero/family-beach.jpg'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require('../../assets/dashboard/hero/family-beach.jpg'),
    eyebrow: 'SIVA OS',
    title: 'For The Ones Who Matter.',
    subtitle: 'Build a life worth remembering.',
    caption: 'Family · Purpose · Gratitude · Growth',
  },
];
