"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Reveal-on-scroll wrapper. Renders children invisible, then fades + slides
// them up the first time they enter the viewport. Uses IntersectionObserver
// so there's no scroll-event spam, and disconnects after triggering so the
// animation doesn't replay on re-scroll.
//
// Respects prefers-reduced-motion via the CSS in globals.css — animation
// duration is forced to ~0ms there, so motion-sensitive users see content
// appear instantly without the slide.

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Delay in milliseconds — used to stagger sibling reveals. */
  delay?: number;
  className?: string;
  /** Render as a specific tag (e.g. "section" or "li") for semantic HTML. */
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // If IntersectionObserver isn't available (very old browsers / SSR
    // edge cases), just show the content immediately.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      // Trigger slightly before the element fully enters the viewport so the
      // animation has finished by the time the user is reading it.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as React.ElementType;
  return (
    <Component
      ref={ref}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
      className={`${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      } transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </Component>
  );
}
