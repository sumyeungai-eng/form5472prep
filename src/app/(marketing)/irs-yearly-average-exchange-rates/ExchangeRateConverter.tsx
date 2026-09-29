"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, ArrowRight, Calculator, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  convert,
  findCurrency,
  isConversionDirection,
  searchCurrencies,
  type ConversionDirection,
} from "@/lib/tools/exchange-rates/convert";
import { YEARS, isExchangeRateYear, type ExchangeRateYear } from "@/lib/tools/exchange-rates/data";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

const DEFAULT_CODE = "GBP";
const DEFAULT_YEAR: ExchangeRateYear = YEARS[0];

function parseAmount(value: string | null): number {
  if (!value) return 1000;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1000;
}

export function ExchangeRateConverter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const currencyParam = searchParams.get("currency");
    const yearParam = Number(searchParams.get("year"));
    const dirParam = searchParams.get("dir");

    const currency = findCurrency(currencyParam) ? currencyParam!.toUpperCase() : DEFAULT_CODE;
    const year = isExchangeRateYear(yearParam) ? yearParam : DEFAULT_YEAR;
    const direction: ConversionDirection = isConversionDirection(dirParam)
      ? dirParam
      : "to-usd";
    const amount = parseAmount(searchParams.get("amount"));

    return { currency, year, direction, amount };
    // Only read on first mount — after that, state drives the URL, not the
    // other way around, so typing in the amount field doesn't get clobbered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [code, setCode] = useState(initial.currency);
  const [year, setYear] = useState<ExchangeRateYear>(initial.year);
  const [direction, setDirection] = useState<ConversionDirection>(initial.direction);
  const [amountInput, setAmountInput] = useState(String(initial.amount));
  const [query, setQuery] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = findCurrency(code);
  const amount = Number(amountInput);
  const matches = useMemo(() => searchCurrencies(query).slice(0, 12), [query]);

  const result = useMemo(() => {
    if (!selectedCurrency) return null;
    return convert({ code, year, amount, direction });
  }, [code, year, amount, direction, selectedCurrency]);

  // Keep the URL in sync with the current inputs so the result is shareable.
  // router.replace (not push) avoids stacking history entries, and Next's
  // App Router does not scroll on replace-only param updates.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("currency", code);
    params.set("year", String(year));
    params.set("amount", amountInput || "0");
    params.set("dir", direction);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [code, year, amountInput, direction, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context); fail quietly.
    }
  }

  return (
    <section className="border-b border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              <Calculator className="h-3.5 w-3.5" />
              Converter inputs
            </div>

            <div className="mt-6 space-y-5">
              <div className="relative" ref={selectRef}>
                <span className="text-sm font-medium text-slate-900">
                  Country / currency
                </span>
                <button
                  type="button"
                  onClick={() => setSelectOpen((open) => !open)}
                  className="mt-2 flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-base text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  aria-haspopup="listbox"
                  aria-expanded={selectOpen}
                >
                  <span>
                    {selectedCurrency
                      ? `${selectedCurrency.country} — ${selectedCurrency.currency} (${selectedCurrency.code})`
                      : "Select a currency"}
                  </span>
                  <span className="text-xs text-slate-400">{selectOpen ? "▲" : "▼"}</span>
                </button>

                {selectOpen ? (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search country or currency…"
                      className="w-full rounded-t-lg border-b border-slate-100 px-3 py-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                    <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
                      {matches.length === 0 ? (
                        <li className="px-3 py-2.5 text-sm text-slate-500">
                          No matches
                        </li>
                      ) : (
                        matches.map((row) => (
                          <li key={row.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setCode(row.code);
                                setSelectOpen(false);
                                setQuery("");
                              }}
                              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50"
                            >
                              <span>
                                {row.country} — {row.currency}
                              </span>
                              <span className="font-mono text-xs text-slate-400">
                                {row.code}
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ) : null}
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-900">Tax year</span>
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value) as ExchangeRateYear)}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-900">Amount</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="block text-sm font-medium text-slate-900">
                  Direction
                </span>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 has-[:checked]:border-accent has-[:checked]:ring-2 has-[:checked]:ring-accent/20">
                    <input
                      type="radio"
                      name="direction"
                      checked={direction === "to-usd"}
                      onChange={() => setDirection("to-usd")}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-slate-800">
                      Foreign currency → USD
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 has-[:checked]:border-accent has-[:checked]:ring-2 has-[:checked]:ring-accent/20">
                    <input
                      type="radio"
                      name="direction"
                      checked={direction === "from-usd"}
                      onChange={() => setDirection("from-usd")}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-slate-800">
                      USD → foreign currency
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Conversion result
            </div>

            {result && selectedCurrency ? (
              <>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-900">
                    {year} yearly average rate
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    1 USD = {result.rate} {selectedCurrency.code} (
                    {selectedCurrency.country} {selectedCurrency.currency})
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-mono uppercase tracking-[0.14em] text-slate-500">
                    Formula
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-800">
                    {result.formula}
                  </p>
                </div>

                <div className="mt-5 py-2">
                  <p className="text-sm font-semibold text-slate-900">Result</p>
                  <p className="mt-1 font-serif text-5xl font-semibold tracking-tight text-ink">
                    {direction === "to-usd"
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(result.result)
                      : `${new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(result.result)} ${selectedCurrency.code}`}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Link copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy link to this result
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-6 text-sm text-slate-500">
                Choose a currency, tax year, and amount to see the conversion.
              </p>
            )}

            <div className="mt-6 rounded-xl border border-accent-100 bg-accent-50 p-5">
              <p className="text-sm leading-relaxed text-slate-700">
                Filing Form 5472 for a foreign-owned U.S. LLC? Amounts must be
                stated in U.S. dollars with a schedule showing the exchange
                rate used.
              </p>
              <Link href="/start?src=tool-exchange-rates" className="group mt-4 inline-block">
                <Button className="min-h-11 gap-2">
                  Start your Form 5472 filing — {formatPrice(TIERS.standard.priceCents)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
