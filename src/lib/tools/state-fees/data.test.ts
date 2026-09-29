import { describe, expect, it } from "vitest";
import { STATE_FEES, getStateFees } from "./data";
import { ruleOccurrences } from "./rules";
import { STATE_CODES, type StateCode } from "./types";

// Every state's rule, for an LLC formed on 10 March 2024 with a calendar tax
// year, must produce the expected NEXT due date on or after 29 September 2026.
const CTX = { formed: "2024-03-10", fyeMonth: 12 };
const FROM = "2026-09-29";
const TO = "2028-12-31";

function nextDue(code: StateCode, obligationId: string): string | undefined {
  const obligation = getStateFees(code).obligations.find((o) => o.id === obligationId);
  if (!obligation) throw new Error(`missing ${obligationId}`);
  return ruleOccurrences(obligation.rule, CTX, FROM, TO)[0];
}

describe("state fee data integrity", () => {
  it("covers exactly the ten states, once each", () => {
    expect(STATE_FEES.map((s) => s.code).sort()).toEqual([...STATE_CODES].sort());
  });

  it("gives every source an https URL on an official state or federal domain", () => {
    // nmonesource.com is the New Mexico Compilation Commission's official NMSA.
    const official = /\.gov$|\.us$|^nmonesource\.com$/;
    for (const state of STATE_FEES) {
      for (const src of [state.primarySource, ...state.obligations.map((o) => o.source)]) {
        const host = new URL(src.url).hostname;
        expect(src.url.startsWith("https://"), src.url).toBe(true);
        expect(official.test(host), host).toBe(true);
      }
    }
  });

  it("never puts an unverified or conditional obligation on the calendar", () => {
    for (const state of STATE_FEES) {
      for (const o of state.obligations) {
        if (!o.verified) expect(o.inCalendar, o.id).toBe(false);
        if (o.inCalendar) expect(o.rule.kind, o.id).not.toBe("none");
      }
    }
  });

  it("uses unique obligation ids (they become .ics UIDs)", () => {
    const ids = STATE_FEES.flatMap((s) => s.obligations.map((o) => o.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("next state due date for an LLC formed 10 March 2024 (calendar year), from 29 September 2026", () => {
  it("Delaware: first $400 LLC tax on 1 June 2027", () => {
    expect(nextDue("DE", "de-annual-tax")).toBe("2027-06-01");
  });

  it("Wyoming: annual report on 1 March 2027 (first day of the anniversary month)", () => {
    expect(nextDue("WY", "wy-annual-report")).toBe("2027-03-01");
  });

  it("New Mexico: nothing recurring", () => {
    expect(getStateFees("NM").obligations).toEqual([]);
  });

  it("Florida: annual report by 1 May 2027", () => {
    expect(nextDue("FL", "fl-annual-report")).toBe("2027-05-01");
  });

  it("Nevada: annual list and business license by 31 March 2027", () => {
    expect(nextDue("NV", "nv-annual-list")).toBe("2027-03-31");
    expect(nextDue("NV", "nv-business-license")).toBe("2027-03-31");
  });

  it("Texas: franchise tax report / PIR on 15 May 2027", () => {
    expect(nextDue("TX", "tx-franchise")).toBe("2027-05-15");
  });

  it("New York: biennial statement in March 2028 (filed March 2026 already)", () => {
    expect(nextDue("NY", "ny-biennial")).toBe("2028-03-31");
  });

  it("New York: publication deadline is long past, so nothing is dated", () => {
    expect(nextDue("NY", "ny-publication")).toBeUndefined();
  });

  it("California: $800 annual tax on 15 April 2027, Form 568 on 15 April 2027", () => {
    expect(nextDue("CA", "ca-annual-tax")).toBe("2027-04-15");
    expect(nextDue("CA", "ca-568")).toBe("2027-04-15");
  });

  it("California: next Statement of Information at the end of March 2028", () => {
    expect(nextDue("CA", "ca-soi")).toBe("2028-03-31");
  });

  it("Montana: annual report by 15 April 2027", () => {
    expect(nextDue("MT", "mt-annual-report")).toBe("2027-04-15");
  });

  it("Colorado: periodic report is not dated (report month unverified)", () => {
    const co = getStateFees("CO").obligations[0];
    expect(co.inCalendar).toBe(false);
    expect(nextDue("CO", "co-periodic")).toBeUndefined();
  });
});

describe("first-year timing", () => {
  it("Wyoming: an LLC formed 15 January first reports on 1 January of the next year (SOS FAQ example)", () => {
    const rule = getStateFees("WY").obligations[0].rule;
    expect(ruleOccurrences(rule, { formed: "2025-01-15", fyeMonth: 12 }, "2025-01-01", "2026-12-31")).toEqual([
      "2026-01-01",
    ]);
  });

  it("Delaware and Florida: nothing is due in the formation year", () => {
    for (const [code, id] of [["DE", "de-annual-tax"], ["FL", "fl-annual-report"]] as const) {
      const rule = getStateFees(code).obligations.find((o) => o.id === id)!.rule;
      const dates = ruleOccurrences(rule, { formed: "2026-01-05", fyeMonth: 12 }, "2026-01-01", "2027-12-31");
      expect(dates[0]?.startsWith("2027-"), code).toBe(true);
    }
  });

  it("California: first $800 is due the 15th day of the 4th month after formation (FTB example)", () => {
    const rule = getStateFees("CA").obligations.find((o) => o.id === "ca-annual-tax")!.rule;
    // FTB: registered June 18, 2020 → due September 15, 2020.
    expect(ruleOccurrences(rule, { formed: "2020-06-18", fyeMonth: 12 }, "2020-01-01", "2020-12-31")).toEqual([
      "2020-09-15",
    ]);
  });

  it("New York: publication is due 120 days after a recent formation", () => {
    const rule = getStateFees("NY").obligations.find((o) => o.id === "ny-publication")!.rule;
    expect(ruleOccurrences(rule, { formed: "2026-08-01", fyeMonth: 12 }, FROM, TO)).toEqual(["2026-11-29"]);
  });

  it("Texas: first report is due 15 May of the year after registration (Comptroller example)", () => {
    const rule = getStateFees("TX").obligations[0].rule;
    // Registered 20 Dec 2023 → first annual report in 2024.
    expect(ruleOccurrences(rule, { formed: "2023-12-20", fyeMonth: 12 }, "2023-01-01", "2024-12-31")).toEqual([
      "2024-05-15",
    ]);
  });
});
