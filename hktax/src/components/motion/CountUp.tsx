"use client";

import { useEffect, useRef, useState } from "react";

import { formatHKD } from "@/components/wizard/FormFields";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

type CountUpProps = {
  value: number;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter((className): className is string => Boolean(className)).join(" ");
}

function cubicBezierCoordinate(t: number, point1: number, point2: number): number {
  const inverseT = 1 - t;

  return 3 * inverseT * inverseT * t * point1 + 3 * inverseT * t * t * point2 + t * t * t;
}

function cubicBezierDerivative(t: number, point1: number, point2: number): number {
  return (
    3 * (1 - t) * (1 - t) * point1 +
    6 * (1 - t) * t * (point2 - point1) +
    3 * t * t * (1 - point2)
  );
}

function premiumEaseOut(progress: number): number {
  const x1 = 0.16;
  const y1 = 1;
  const x2 = 0.3;
  const y2 = 1;
  let lowerBound = 0;
  let upperBound = 1;
  let t = progress;

  for (let iteration = 0; iteration < 5; iteration += 1) {
    const estimatedX = cubicBezierCoordinate(t, x1, x2) - progress;
    const derivative = cubicBezierDerivative(t, x1, x2);

    if (Math.abs(estimatedX) < 0.001 || derivative === 0) {
      break;
    }

    t -= estimatedX / derivative;
  }

  if (t < 0 || t > 1) {
    t = progress;

    for (let iteration = 0; iteration < 8; iteration += 1) {
      const estimatedX = cubicBezierCoordinate(t, x1, x2);

      if (Math.abs(estimatedX - progress) < 0.001) {
        break;
      }

      if (estimatedX < progress) {
        lowerBound = t;
      } else {
        upperBound = t;
      }

      t = (lowerBound + upperBound) / 2;
    }
  }

  return cubicBezierCoordinate(Math.min(Math.max(t, 0), 1), y1, y2);
}

/**
 * Whether a count-up should run for `value`.
 *
 * Anything that returns false MUST render `value` directly. The figures shown
 * here are tax amounts loaded asynchronously, so a skipped or already-finished
 * animation must never leave 0 or a stale number on screen.
 */
export function shouldAnimateCountUp(
  value: number,
  reducedMotion: boolean,
  lastAnimatedValue: number | null,
): boolean {
  if (reducedMotion) {
    return false;
  }

  if (!Number.isFinite(value) || value === 0) {
    return false;
  }

  // requestAnimationFrame is suspended while the document is hidden, so an
  // animation started here would never advance. Show the real figure instead.
  if (typeof document !== "undefined" && document.hidden) {
    return false;
  }

  return lastAnimatedValue !== value;
}

export function CountUp({ className, value }: CountUpProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<number | null>(null);
  const lastAnimatedValueRef = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Animate towards the CURRENT prop. `value` arrives asynchronously (stored
    // results load after hydration), so this deliberately re-runs when it
    // changes rather than snapshotting the mount-time value.
    if (!shouldAnimateCountUp(value, reducedMotion, lastAnimatedValueRef.current)) {
      setDisplayValue(value);
      return;
    }

    lastAnimatedValueRef.current = value;

    const durationMs = 700;
    let startTime: number | null = null;

    // Deliberately NOT zeroing the figure here. The count starts from the first
    // frame that actually runs, so if rAF never fires (hidden tab, throttled or
    // unavailable) the correct amount stays on screen instead of a stuck HK$0.
    const tick = (timestamp: number): void => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsedMs = timestamp - startTime;
      const progress = Math.min(elapsedMs / durationMs, 1);

      if (progress < 1) {
        setDisplayValue(Math.round(value * premiumEaseOut(progress)));
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      setDisplayValue(value);
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [reducedMotion, value]);

  return <span className={cx("tabular-nums", className)}>{formatHKD(displayValue)}</span>;
}
