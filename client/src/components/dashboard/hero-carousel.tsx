import { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/constants/theme';

export type HeroTone = 'info' | 'success' | 'warning' | 'danger' | 'violet';

export type HeroSlide = {
  id: string;
  /** Web-specific local image (1920x540 hero art). Overrides `image` on Web. */
  imageWeb?: ImageSourcePropType;
  /** Android/iOS-specific local image (1080x600 hero art). Overrides `image` on native. */
  imageMobile?: ImageSourcePropType;
  /** Optional shared local image asset (fallback for both platforms). */
  image?: ImageSourcePropType;
  /** Semantic accent for the slide. */
  tone?: HeroTone;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  caption?: string;
  /** Large faint watermark glyph shown on image-less placeholder slides. */
  glyph?: string;
};

export type HeroCarouselProps = {
  slides: HeroSlide[];
  /**
   * Height of each slide. When omitted the container height is derived
   * responsively from its measured width using the platform aspect ratio:
   *   Web container ratio = aspectWeb (default 1920 / 540)
   *   Mobile container ratio = aspectMobile (default 1080 / 600)
   */
  height?: number;
  /** Web container aspect ratio (width/height). Defaults to 1920/540. */
  aspectWeb?: number;
  /** Android/iOS container aspect ratio (width/height). Defaults to 1080/600. */
  aspectMobile?: number;
  /** Automatic advance interval in ms (default 5600). */
  intervalMs?: number;
  /** Centralised SIVA OS brand shown on every slide. */
  brand?: { name: string; tagline?: string };
  style?: ViewStyle;
};

/** Web hero art aspect ratio (1920x540). */
export const HERO_ASPECT_WEB_DEFAULT = 1920 / 540;
/** Mobile hero art aspect ratio (1080x600). */
export const HERO_ASPECT_MOBILE_DEFAULT = 1080 / 600;

const TONE_COLOR: Record<HeroTone, ThemeColor> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  violet: 'violet',
};

const FADE_STEPS = [
  0.52, 0.44, 0.36, 0.28, 0.2, 0.13, 0.07, 0.03, 0,
] as const;

/**
 * A premium, data/config driven hero carousel.
 *
 * - One large banner visible at a time with a smooth slide transition.
 * - Auto-advances every `intervalMs`, pauses while the user is swiping,
 *   then resumes automatically.
 * - Loops continuously.
 * - Manual prev/next controls + pagination dots.
 * - Slides may reference a local image (rendered cover-cropped beneath a dark
 *   fade) or fall back to an elegant tonal gradient placeholder.
 *
 * The strip is driven by a single shared `progress` value so pan + auto-advance
 * stay perfectly in sync, and only the active slide gets a subtle Ken Burns
 * scale (kept cheap).
 */
export function HeroCarousel({
  slides,
  height,
  intervalMs = 5600,
  brand,
  aspectWeb = HERO_ASPECT_WEB_DEFAULT,
  aspectMobile = HERO_ASPECT_MOBILE_DEFAULT,
  style,
}: HeroCarouselProps) {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';
  const aspect = isWeb ? aspectWeb : aspectMobile;
  const [width, setWidth] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const progress = useSharedValue(0);
  const offset = useSharedValue(0);
  const count = slides.length;
  const safe = count > 0 ? count : 1;

  /** Container height, derived responsively from the measured width (kept
   * at or above any explicit `height` fallback until width is known). */
  const derivedHeight = width > 0 ? Math.round(width / aspect) : (height ?? Math.round(128));
  const slideHeight = derivedHeight;

  const resolveSource = (slide: HeroSlide) =>
    (isWeb ? slide.imageWeb : slide.imageMobile) ?? slide.image;

  const advanceTo = (target: number) => {
    const wrapped = ((Math.round(target) % safe) + safe) % safe;
    progress.value = withTiming(wrapped, { duration: 500 });
    setActiveIndex(wrapped);
  };

  useEffect(() => {
    if (interacting || count === 0) return;
    const id = setInterval(() => {
      advanceTo(activeIndex + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [interacting, count, intervalMs, advanceTo, activeIndex, safe]);

  const startInteraction = () => setInteracting(true);
  const endInteraction = (abs: number) => {
    setInteracting(false);
    advanceTo(abs);
  };

  const pan = Gesture.Pan()
    .enabled(count > 1 && width > 0)
    .onBegin(() => {
      offset.value = progress.value;
      runOnJS(startInteraction)();
    })
    .onUpdate((e) => {
      progress.value = offset.value - e.translationX / width;
    })
    .onEnd((e) => {
      const target = offset.value - e.translationX / width;
      runOnJS(endInteraction)(target);
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * width }],
  }));

  const goPrev = () => advanceTo(activeIndex - 1);
  const goNext = () => advanceTo(activeIndex + 1);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (count === 0) {
    return null;
  }

  return (
    <View
      onLayout={onLayout}
      style={[styles.frame, { height: derivedHeight }, style]}
      accessibilityLabel="Hero carousel"
    >
      {width > 0 ? (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.strip, stripStyle]}>
            {slides.map((slide, i) => (
              <Slide
                key={slide.id}
                slide={slide}
                source={resolveSource(slide)}
                width={width}
                height={slideHeight}
                active={activeIndex === i}
                accent={theme[TONE_COLOR[slide.tone ?? 'info']]}
                muted={theme.textMuted}
                brand={brand}
                showOverlay={isWeb}
              />
            ))}
          </Animated.View>
        </GestureDetector>
      ) : null}

      {count > 1 ? (
        <>
          <View pointerEvents="box-none" style={styles.controls}>
            <Pressable
              onPress={goPrev}
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
              hitSlop={8}
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.14)' },
                pressed && styles.navPressed,
              ]}
            >
              <ThemedText style={styles.navGlyph}>‹</ThemedText>
            </Pressable>
            <Pressable
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="Next slide"
              hitSlop={8}
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.14)' },
                pressed && styles.navPressed,
              ]}
            >
              <ThemedText style={styles.navGlyph}>›</ThemedText>
            </Pressable>
          </View>

          <View pointerEvents="none" style={styles.dots}>
            {slides.map((_, i) => {
              const active = activeIndex === i;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    active
                      ? { width: 20, backgroundColor: 'rgba(255,255,255,0.95)' }
                      : { backgroundColor: 'rgba(255,255,255,0.35)' },
                  ]}
                />
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

/** One banner: image (cover) or tonal gradient placeholder, dark fade, content. */
function Slide({
  slide,
  source,
  width,
  height,
  active,
  accent,
  muted,
  brand,
  showOverlay,
}: {
  slide: HeroSlide;
  source?: ImageSourcePropType;
  width: number;
  height: number;
  active: boolean;
  accent: string;
  muted: string;
  brand?: { name: string; tagline?: string };
  /** When false (mobile), only the artwork is shown — text/overlays hidden. */
  showOverlay: boolean;
}) {
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Placeholder
          glyph={slide.glyph ?? '✦'}
          accent={accent}
          style={StyleSheet.absoluteFill}
        />
      )}

      {showOverlay ? (
        <>
          {/* Dark bottom fade built from stacked translucent layers. */}
          <Fade />

          {/* SIVA OS brand chip, top-left. */}
          {brand?.name ? (
            <View style={styles.brandChip} pointerEvents="none">
              <View style={[styles.brandBar, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
              <View style={styles.brandText}>
                <ThemedText style={[styles.brandName, { color: '#FFFFFF' }]} numberOfLines={1}>
                  {brand.name}
                </ThemedText>
                {brand.tagline ? (
                  <ThemedText style={[styles.brandTagline, { color: '#FFFFFF' }]} numberOfLines={1}>
                    {brand.tagline}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Content, bottom-left aligned so text sits over the fade. */}
          <View style={styles.content} pointerEvents="none">
            {slide.eyebrow ? (
              <View style={[styles.eyebrowChip, { backgroundColor: 'rgba(0,0,0,0.32)' }]}>
                <ThemedText style={[styles.eyebrow, { color: '#FFFFFF' }]} numberOfLines={1}>
                  {slide.eyebrow}
                </ThemedText>
              </View>
            ) : null}
            <ThemedText
              style={[styles.title, { color: '#FFFFFF' }]}
              numberOfLines={2}
            >
              {slide.title}
            </ThemedText>
            {slide.subtitle ? (
              <ThemedText style={[styles.subtitle, { color: '#E7EBF2' }]} numberOfLines={1}>
                {slide.subtitle}
              </ThemedText>
            ) : null}
            {slide.caption ? (
              <ThemedText style={[styles.caption, { color: muted }]} numberOfLines={2}>
                {slide.caption}
              </ThemedText>
            ) : null}
            {/* elegant lightning divider accent above the active line */}
            <View style={styles.lightningDivider}>
              <View style={[styles.lightningBar, { backgroundColor: accent }]} />
              <View style={[styles.lightningNotch, { borderTopColor: accent }]} />
            </View>
            <View
              style={[styles.activeLine, { opacity: active ? 1 : 0.45, backgroundColor: accent, height: 3 }]}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

/** Layered translucent black views approximate a smooth bottom-to-top fade. */
function Fade() {
  const steps = FADE_STEPS.length;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {FADE_STEPS.map((alpha, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${((i + 1) / steps) * 100}%`,
            backgroundColor: `rgba(3, 6, 12, ${alpha})`,
          }}
        />
      ))}
    </View>
  );
}

/** Tonal gradient placeholder used when no personal image is provided. */
function Placeholder({
  glyph,
  accent,
  style,
}: {
  glyph: string;
  accent: string;
  style: ViewStyle;
}) {
  return (
    <View style={[style, { backgroundColor: '#0B0E15' }]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: accent,
            opacity: 0.16,
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: accent,
            opacity: 0.1,
            top: undefined,
            bottom: '30%',
          },
        ]}
      />
      <ThemedText style={[styles.placeholderGlyph, { color: `${accent}33` }]} allowFontScaling={false}>
        {glyph}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#0B0E15',
    position: 'relative',
  },
  strip: {
    flexDirection: 'row',
    width: '100%',
  },
  content: {
    ...(StyleSheet.absoluteFill as object),
    justifyContent: 'flex-end',
    padding: Spacing.four,
    paddingBottom: Spacing.four + Spacing.three,
  },
  eyebrowChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.two,
    maxWidth: '100%',
  },
  eyebrow: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
    lineHeight: FontSize.hero + 6,
  },
  subtitle: {
    fontSize: FontSize.lead,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.one,
  },
  caption: {
    fontSize: FontSize.small,
    marginTop: Spacing.two,
    opacity: 0.9,
  },
  activeLine: {
    width: 42,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  brandChip: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandBar: {
    width: 4,
    height: 34,
    borderRadius: Radius.full,
  },
  brandText: {
    flexShrink: 1,
  },
  brandName: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.6,
    opacity: 0.85,
    marginTop: Spacing.half,
  },
  lightningDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  lightningBar: {
    width: 24,
    height: 3,
    borderRadius: Radius.full,
  },
  lightningNotch: {
    width: 0,
    height: 0,
    marginLeft: -1,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  placeholderGlyph: {
    position: 'absolute',
    right: Spacing.four,
    top: Spacing.three,
    fontSize: 120,
    fontWeight: FontWeight.extrabold,
  },
  controls: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navPressed: {
    opacity: 0.7,
  },
  navGlyph: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: FontWeight.bold,
  },
  dots: {
    position: 'absolute',
    left: Spacing.four,
    bottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    height: 6,
    borderRadius: Radius.full,
    marginLeft: 0,
  },
});
