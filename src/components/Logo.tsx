import { cn } from "@/lib/utils";

// Inline-SVG logo so it inherits text color where useful and never flashes
// on slow connections. Two variants:
//   <Logo />       — icon + "Form5472 Prep" wordmark, horizontal
//   <Logo mark />  — just the document mark, square
export function Logo({
  mark = false,
  className,
  ariaLabel = "Form5472 Prep",
}: {
  mark?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  if (mark) {
    return (
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label={ariaLabel}
        className={cn("h-7 w-7", className)}
      >
        <path d="M10 6 H42 L58 22 V58 H10 Z" fill="#1e3a8a" />
        <path
          d="M42 6 V22 H58"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <text
          x="34"
          y="48"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui, sans-serif"
          fontWeight="800"
          fontSize="16"
          letterSpacing="0.5"
          fill="#ffffff"
        >
          5472
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 56"
      role="img"
      aria-label={ariaLabel}
      className={cn("h-12 w-auto", className)}
    >
      <g transform="translate(0,8)">
        <path d="M5 0 H30 L42 12 V40 H5 Z" fill="#1e3a8a" />
        <path
          d="M30 0 V12 H42"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <text
          x="23.5"
          y="29"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui, sans-serif"
          fontWeight="800"
          fontSize="11"
          letterSpacing="0.4"
          fill="#ffffff"
        >
          5472
        </text>
      </g>
      <text
        x="56"
        y="36"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="-0.4"
      >
        <tspan fill="currentColor">Form</tspan>
        <tspan fill="#1e3a8a">5472</tspan>
        <tspan fill="currentColor"> Prep</tspan>
      </text>
    </svg>
  );
}
