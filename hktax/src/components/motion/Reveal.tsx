"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";

import { useReducedMotion } from "@/lib/motion/useReducedMotion";

type RevealElement = "div" | "section" | "li";

type RevealProps = {
  children: ReactNode;
  delayMs?: number;
  as?: RevealElement;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter((className): className is string => Boolean(className)).join(" ");
}

function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return rect.top < viewportHeight && rect.bottom > 0 && rect.left < viewportWidth && rect.right > 0;
}

export function Reveal({
  as = "div",
  children,
  className,
  delayMs = 0
}: RevealProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const elementRef = useRef<HTMLElement | null>(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const setElementRef = useCallback((node: HTMLElement | null): void => {
    elementRef.current = node;
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion) {
      setCanAnimate(false);
      setRevealed(true);
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (isElementInViewport(element)) {
      setCanAnimate(false);
      setRevealed(true);
      return;
    }

    setCanAnimate(true);
    setRevealed(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || revealed || !canAnimate) {
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setRevealed(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.15
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [canAnimate, reducedMotion, revealed]);

  const style: CSSProperties | undefined =
    canAnimate && revealed && delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined;
  const motionClassName = canAnimate && !revealed ? "motion-reveal-pending" : undefined;
  const revealClassName = canAnimate && revealed ? "animate-rise-in" : undefined;
  const combinedClassName = cx(className, motionClassName, revealClassName);

  if (as === "section") {
    return (
      <section ref={setElementRef} className={combinedClassName} style={style}>
        {children}
      </section>
    );
  }

  if (as === "li") {
    return (
      <li ref={setElementRef} className={combinedClassName} style={style}>
        {children}
      </li>
    );
  }

  return (
    <div ref={setElementRef} className={combinedClassName} style={style}>
      {children}
    </div>
  );
}
