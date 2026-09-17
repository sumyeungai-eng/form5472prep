import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EIN_PRICE_CENTS, ITIN_PRICE_CENTS } from "@/lib/pricing";
import { orderCtaHref, type OrderProduct } from "@/lib/blog-order-cta";

// pricing.ts is the single source of truth for the dollar figures but doesn't
// export its own cents→display formatter, so this follows the fallback
// formula: whole dollars only (these two prices are always whole dollars).
function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Copy taken near-verbatim from the /ein and /itin landing pages — no new
// promises, timelines, or guarantees invented here.
const COPY: Record<
  OrderProduct,
  {
    heading: string;
    buttonLabel: string;
    sentence: string;
    secondaryLabel: string;
    secondaryHref: string;
  }
> = {
  ein: {
    heading: "Need an EIN for your LLC?",
    buttonLabel: `Start your EIN application — ${formatPrice(EIN_PRICE_CENTS)}`,
    sentence:
      "We prepare Form SS-4 and obtain your EIN directly from the IRS by fax or phone — no SSN, no ITIN, and no passport mailing required.",
    secondaryLabel: "How the EIN service works",
    secondaryHref: "/ein",
  },
  itin: {
    heading: "Need an ITIN?",
    buttonLabel: `Start your ITIN application — ${formatPrice(ITIN_PRICE_CENTS)}`,
    sentence:
      "Eligible applications are forwarded to an IRS-authorized Certifying Acceptance Agent (CAA) for document review, and you keep your original documents throughout.",
    secondaryLabel: "How the ITIN service works",
    secondaryHref: "/itin",
  },
};

const PRIMARY_BUTTON_CLASSES =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-center text-sm font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

const SECONDARY_LINK_CLASSES =
  "mt-2 inline-block rounded text-center text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function BlogOrderCta({
  products,
  placement,
}: {
  products: OrderProduct[];
  placement: "top" | "bottom";
}) {
  if (products.length === 0) return null;

  const heading = products.length === 1 ? COPY[products[0]].heading : "Ready to apply?";
  const isTop = placement === "top";

  const card = (
    <div
      className={`rounded-2xl border border-accent/20 bg-accent-50/40 ${
        isTop ? "p-5 sm:p-6" : "p-6 sm:p-8"
      }`}
    >
      <h2 className={`font-serif font-semibold text-ink ${isTop ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>
        {heading}
      </h2>
      <div className={`mt-4 grid gap-5 ${products.length > 1 ? "sm:grid-cols-2" : "sm:max-w-sm"}`}>
        {products.map((product) => {
          const copy = COPY[product];
          return (
            <div key={product} className="flex flex-col">
              <p className="text-sm leading-6 text-slate-600">{copy.sentence}</p>
              <Link
                href={orderCtaHref(product)}
                data-cta={`blog-order-${product}-${placement}`}
                className={`${PRIMARY_BUTTON_CLASSES} mt-4`}
              >
                {copy.buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={copy.secondaryHref} className={SECONDARY_LINK_CLASSES}>
                {copy.secondaryLabel}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Top: sits full-width between the hero header and the two-column article
  // layout, so it needs its own max-width/gutter. Bottom: already lives
  // inside the article's padded white card, so it only needs a separator
  // from the body copy above it.
  if (isTop) {
    return <div className="mx-auto max-w-6xl px-6 pt-8">{card}</div>;
  }
  return <div className="mt-12 border-t border-slate-200 pt-10">{card}</div>;
}
