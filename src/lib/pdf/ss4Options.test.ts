import { describe, expect, it } from "vitest";
import {
  defaultSs4Options,
  normalizeUsDate,
  parseSs4Options,
  splitAddress,
  ss4Warnings,
  toFormText,
  unencodableChars,
  type Ss4Source,
} from "./ss4Options";

const source: Ss4Source = {
  fullName: "Alex Rivera",
  phone: "+1 307 555 0100",
  llcName: "Blue Harbor Trading LLC",
  llcState: "Wyoming",
  llcFormedDate: "2026-03-14",
  llcCounty: null,
  llcMembers: null,
  businessMailingAddress: "30 N Gould St, Ste R\nSheridan, WY 82801",
  businessType: "Online retail",
  businessPurpose: "Sell household goods online",
  principalProducts: "Household goods",
  ownerName: "Maria Alvarez",
  ownerResidence: "Spain",
  ownerCitizenship: "Spain",
  responsiblePartyTin: null,
};

describe("splitAddress", () => {
  it("splits a multi-line US address", () => {
    expect(splitAddress("30 N Gould St, Ste R\nSheridan, WY 82801")).toEqual({
      line: "30 N Gould St, Ste R",
      cityStateZip: "Sheridan, WY 82801",
    });
  });

  it("splits a single-line US address at the city, state and ZIP", () => {
    expect(splitAddress("30 N Gould St, Ste R, Sheridan, WY 82801")).toEqual({
      line: "30 N Gould St, Ste R",
      cityStateZip: "Sheridan, WY 82801",
    });
    expect(splitAddress("1209 Mountain Road Pl NE, Ste N, Albuquerque, NM 87110-1234, USA")).toEqual({
      line: "1209 Mountain Road Pl NE, Ste N",
      cityStateZip: "Albuquerque, NM 87110-1234, USA",
    });
  });

  it("splits a foreign single-line address at the last two comma parts", () => {
    expect(splitAddress("Calle Serrano 1, 28001 Madrid, Spain")).toEqual({
      line: "Calle Serrano 1",
      cityStateZip: "28001 Madrid, Spain",
    });
  });

  it("keeps a two-part single-line address whole", () => {
    expect(splitAddress("1209 Mountain Road Pl NE, Ste N")).toEqual({
      line: "1209 Mountain Road Pl NE, Ste N",
      cityStateZip: "",
    });
  });

  it("handles a foreign address with a country line", () => {
    expect(splitAddress("Calle Serrano 1\n28001 Madrid\nSpain")).toEqual({
      line: "Calle Serrano 1",
      cityStateZip: "28001 Madrid, Spain",
    });
  });
});

describe("normalizeUsDate", () => {
  it("formats a valid date", () => {
    expect(normalizeUsDate("2026-03-14")).toBe("03/14/2026");
  });

  it("returns blank for unparseable input", () => {
    expect(normalizeUsDate("not a date")).toBe("");
  });
});

describe("defaultSs4Options", () => {
  it("defaults a single-member LLC to other entity type", () => {
    const options = defaultSs4Options(source);
    expect(options.llcMembers).toBe("1");
    expect(options.entityType).toBe("other");
    expect(options.entityOtherText).toBe("Foreign-owned U.S. disregarded entity");
  });

  it("defaults a 3-member LLC source to partnership", () => {
    const options = defaultSs4Options({ ...source, businessType: "3-member LLC" });
    expect(options.llcMembers).toBe("3");
    expect(options.entityType).toBe("partnership");
    expect(options.entityOtherText).toBe("");
  });

  it("does not infer member count or partnership entity type from business purpose prose", () => {
    const options = defaultSs4Options({ ...source, businessPurpose: "strategic partnership with suppliers" });
    expect(options.llcMembers).toBe("1");
    expect(options.entityType).toBe("other");
  });

  it("combines county and state when county does not include county", () => {
    const options = defaultSs4Options({ ...source, llcCounty: "Sheridan", llcState: "Wyoming" });
    expect(options.countyAndState).toBe("Sheridan County, Wyoming");
  });

  it("does not double county when county already includes county", () => {
    const options = defaultSs4Options({ ...source, llcCounty: "Sheridan County", llcState: "Wyoming" });
    expect(options.countyAndState).toBe("Sheridan County, Wyoming");
  });

  it("uses state alone when county is blank", () => {
    const options = defaultSs4Options({ ...source, llcCounty: null, llcState: "Wyoming" });
    expect(options.countyAndState).toBe("Wyoming");
  });

  it("leaves county and state blank when both are blank", () => {
    const options = defaultSs4Options({ ...source, llcCounty: null, llcState: null });
    expect(options.countyAndState).toBe("");
  });

  it("prefers explicit LLC member count from the source", () => {
    const options = defaultSs4Options({ ...source, llcMembers: 3 });
    expect(options.llcMembers).toBe("3");
    expect(options.entityType).toBe("partnership");
  });

  it("falls back to business type text when explicit LLC member count is blank", () => {
    const baseOptions = defaultSs4Options({ ...source, llcMembers: null });
    expect(baseOptions.llcMembers).toBe("1");
    expect(baseOptions.entityType).toBe("other");

    const inferredOptions = defaultSs4Options({ ...source, llcMembers: null, businessType: "3-member LLC" });
    expect(inferredOptions.llcMembers).toBe("3");
    expect(inferredOptions.entityType).toBe("partnership");
  });

  it("carries responsible party TIN through", () => {
    const options = defaultSs4Options({ ...source, responsiblePartyTin: "123-45-6789" });
    expect(options.responsiblePartyTin).toBe("123-45-6789");
  });
});

describe("parseSs4Options", () => {
  it("survives garbage input", () => {
    expect(parseSs4Options("oops", source)).toEqual(defaultSs4Options(source));
    expect(parseSs4Options(null, source)).toEqual(defaultSs4Options(source));
  });

  it("merges a partial object", () => {
    const parsed = parseSs4Options({ tradeName: "Blue Harbor", form944: true }, source);
    expect(parsed.tradeName).toBe("Blue Harbor");
    expect(parsed.form944).toBe(true);
    expect(parsed.responsibleParty).toBe("Maria Alvarez");
  });

  it("drops unknown keys", () => {
    const parsed = parseSs4Options({ tradeName: "Blue Harbor", surprise: "nope" }, source);
    expect("surprise" in parsed).toBe(false);
  });

  it("bounds strings, closing month, and numeric inputs", () => {
    const parsed = parseSs4Options(
      {
        tradeName: "x".repeat(5000),
        principalProducts: "y".repeat(5000),
        reasonSpecify: "z".repeat(5000),
        careOf: "Line one\n\tLine two",
        closingMonth: "Smarch",
        llcMembers: "abc",
        employeesAgricultural: "too many",
      },
      source,
    );
    expect(parsed.tradeName).toHaveLength(200);
    expect(parsed.principalProducts).toHaveLength(300);
    expect(parsed.reasonSpecify).toHaveLength(40);
    expect(parsed.careOf).toBe("Line one Line two");
    expect(parsed.closingMonth).toBe("December");
    expect(parsed.llcMembers).toBe("1");
    expect(parsed.employeesAgricultural).toBe("0");
  });
});

describe("form text encoding helpers", () => {
  it("normalizes common Latin characters and whitespace", () => {
    expect(toFormText("José Łódź")).toBe("Jose Lodz");
    expect(toFormText("“Quoted” – dash — more\n\ttext   here")).toBe('"Quoted" - dash - more text here');
  });

  it("reports distinct remaining unencodable characters", () => {
    expect(unencodableChars("李 明")).toBe("李明");
    expect(unencodableChars("Jose")).toBe("");
  });
});

describe("ss4Warnings", () => {
  it("returns warnings when review fields are blank", () => {
    const options = {
      ...defaultSs4Options(source),
      countyAndState: "",
      responsiblePartyTin: "",
      businessStartDate: "",
      reason: "other" as const,
      reasonSpecify: "",
      activity: "other" as const,
      activityOtherText: "",
    };
    expect(ss4Warnings(options)).toEqual([
      "County and state is blank.",
      "Responsible party TIN is blank.",
      "Business start date is blank.",
      "Reason is Other, but the specify field is blank.",
      "Activity is Other, but the specify field is blank.",
    ]);
  });

  it("returns no warnings for a complete review draft", () => {
    const options = {
      ...defaultSs4Options(source),
      responsiblePartyTin: "000-00-0000",
      activityOtherText: "Retail",
    };
    expect(ss4Warnings(options)).toEqual([]);
  });
});
