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

  if (!rows.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">
            {resultsT(resultsDictionary.bir60Title, lang)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-warm-700">
            {resultsT(resultsDictionary.bir60Specimen, lang)}
          </p>
        </div>
        <Link
          href="/bir60/"
          className="focus-ring inline-flex min-h-11 flex-none items-center justify-center rounded-md bg-gold px-5 py-2 text-sm font-bold text-navy-900 hover:bg-gold-600 hover:text-white"
        >
          {resultsT(resultsDictionary.generateDraft, lang)}
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-warm-200 text-left text-sm">
          <thead className="bg-warm-50 text-xs uppercase text-warm-600">
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
