export function countryFlagEmoji(country: string | null | undefined): string {
  if (!country) return "";
  const code = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";

  return String.fromCodePoint(
    ...code.split("").map((letter) => 0x1f1e6 + letter.charCodeAt(0) - "A".charCodeAt(0)),
  );
}

export function CountryFlag({ country }: { country: string | null | undefined }) {
  const flag = countryFlagEmoji(country);
  if (!flag) return null;
  return <span aria-hidden="true">{flag}</span>;
}
