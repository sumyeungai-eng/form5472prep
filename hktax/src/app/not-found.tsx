import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="bg-warm-50 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl rounded-lg border border-warm-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            404 / Not found
          </p>
          <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
            找不到頁面 / Page not found
          </h1>
          <p className="mt-4 text-base leading-7 text-warm-700">
            此頁面不存在或已被移動。This page does not exist or may have moved.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-navy-900 px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
            >
              首頁 / Home
            </Link>
            <Link href="/wizard" className="btn-primary">
              報稅精靈 / Tax Wizard
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
