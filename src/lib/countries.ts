// Country list for wizard dropdowns. Sorted alphabetically.
// Names match the spelling IRS publications use (e.g. "United Kingdom"
// not "Britain", "Türkiye" not "Turkey"). Replaces free-text country
// inputs that historically let customers enter demonyms ("Canadian",
// "British") which then surfaced as form-field contradictions on
// Form 5472 lines 4d / 4e / 8f / 8g.
//
// Curated to the 50 most-common foreign-founder countries in our
// historical filings (from /admin/sources data). Long-tail countries
// reachable via the bottom "Other (enter manually)" escape hatch so we
// don't block a legitimate filer from Tonga or Bhutan — they just type
// the name in free text after picking that option.
//
// To add a country: insert in alphabetical position. To rename one to
// match a new IRS spelling change: edit in-place. No dependency on any
// external list library.
export const COUNTRIES: string[] = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Malta",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Türkiye",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Vietnam",
];
