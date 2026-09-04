/**
 * SIVA OS brand identity.
 *
 * Centralized so the product name, tagline and brand color treatment can be
 * changed from one place without editing components.
 */

export const BRAND = {
  name: 'SIVA OS',
  tagline: 'Build a Better Me',
  descriptor: 'Personal Operating System',
  /**
   * Brand color treatment (blue + cyan + subtle violet/indigo). These are the
   * SIVA OS identity colors — distinct from the semantic dashboard colors.
   */
  colors: {
    blue: '#4D7CFE',
    cyan: '#2BD4E0',
    violet: '#8A7BFF',
    // Soft translucent tints used for layered surfaces (a gentle gradient
    // approximation without a gradient dependency).
    blueSoft: 'rgba(77, 124, 254, 0.5)',
    cyanSoft: 'rgba(43, 212, 224, 0.4)',
    violetSoft: 'rgba(138, 123, 255, 0.4)',
  },
} as const;

export type BrandConfig = typeof BRAND;
