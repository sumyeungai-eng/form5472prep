import Link from "next/link";
import { getBir60MappingRows, type Bir60MappingFlag } from "@/lib/results/bir60Mapping";
import type { ResultsLanguage } from "@/lib/results/resultsDictionary";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";

type Bir60PanelProps = {
  flags: Bir60MappingFlag[];
  lang: ResultsLanguage;
};

export function Bir60Panel({ flags, lang }: Bir60PanelProps) {
  const rows = getBir60MappingRows(flags);
  const tableHeadingTracking = lang === "en" ? "tracking-[0.12em] uppercase" : "";

  if (!rows.length) {
    return null;
  }

  return (
    <section className="card p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="display-subsection">
            {resultsT(resultsDictionary.bir60Title, lang)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-warm-700">
            {resultsT(resultsDictionary.bir60Specimen, lang)}
          </p>
        </div>
        <Link
          href="/bir60/"
          className="btn-primary flex-none"
        >
          {resultsT(resultsDictionary.generateDraft, lang)}
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto rounded-md border border-warm-150 shadow-field">
        <table className="min-w-full divide-y divide-warm-200 text-left text-sm">
          <thead className={`bg-warm-50 text-xs text-warm-600 ${tableHeadingTracking}`}>
            <tr>
              <th className="px-3 py-2 font-bold">{resultsT(resultsDictionary.bir60Part, lang)}</th>
              <th className="px-3 py-2 font-bold">{resultsT(resultsDictionary.bir60Figure, lang)}</th>
              <th className="px-3 py-2 font-bold">{resultsT(resultsDictionary.bir60Note, lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100 text-warm-700">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-3 py-3 font-bold text-navy-900">{row.part}</td>
                <td className="px-3 py-3 leading-6">{resultsT(row.figure, lang)}</td>
                <td className="px-3 py-3 leading-6">{resultsT(row.note, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
