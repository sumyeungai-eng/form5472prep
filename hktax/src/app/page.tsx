export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Hong Kong personal tax calculator
        </p>
        <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">
          香港報稅助手 / HK Tax Assistant
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          A bilingual educational website scaffold for helping Hong Kong taxpayers understand personal tax filing concepts.
        </p>
        <div className="mt-10 border-l-4 border-amber-500 bg-amber-50 p-5 text-base leading-7 text-amber-950">
          <p className="font-semibold">Important disclaimer</p>
          <p className="mt-2">
            This is an educational tool only. It is not tax advice and is not affiliated with the Hong Kong Inland Revenue Department (稅務局/IRD).
          </p>
        </div>
      </section>
    </main>
  );
}
