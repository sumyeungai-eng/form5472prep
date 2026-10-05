import { describe, expect, it } from "vitest";
import { countryForProse, displayCaseAddressPart, ownerNationalityClause } from "./textFormat";

describe("displayCaseAddressPart", () => {
  it.each([
    ["kowloon", "Kowloon"],
    ["NEW YORK", "New York"],
    ["tsim sha tsui east", "Tsim Sha Tsui East"],
    ["RIO DE JANEIRO", "Rio de Janeiro"],
    ["stratford-upon-avon", "Stratford-upon-Avon"],
    ["the hague", "The Hague"],
    ["HONG KONG SAR", "Hong Kong SAR"],
    ["münchen", "München"],
    ["  kowloon   city ", "Kowloon City"],
  ])("title-cases the all-lower or all-upper city %j as %j", (input, expected) => {
    expect(displayCaseAddressPart(input, "city")).toBe(expected);
  });

  it.each(["McAllen", "deLeon", "Hong Kong SAR", "Kowloon", "St. Louis"])(
    "leaves mixed-case input %j untouched",
    (input) => {
      expect(displayCaseAddressPart(input, "city")).toBe(input);
      expect(displayCaseAddressPart(input, "region")).toBe(input);
    },
  );

  it("prints short state/province abbreviations in capitals", () => {
    expect(displayCaseAddressPart("WY", "region")).toBe("WY");
    expect(displayCaseAddressPart("wy", "region")).toBe("WY");
    expect(displayCaseAddressPart("nsw", "region")).toBe("NSW");
    expect(displayCaseAddressPart("hong kong", "region")).toBe("Hong Kong");
    expect(displayCaseAddressPart("BRITISH COLUMBIA", "region")).toBe("British Columbia");
  });

  it("keeps a short all-caps city as typed and leaves caseless scripts alone", () => {
    expect(displayCaseAddressPart("LA", "city")).toBe("LA");
    expect(displayCaseAddressPart("九龍", "city")).toBe("九龍");
    expect(displayCaseAddressPart("", "city")).toBe("");
    expect(displayCaseAddressPart(null, "region")).toBe("");
  });
});

describe("displayCaseAddressPart apostrophes", () => {
  it("capitalises after a one-letter elided particle", () => {
    expect(displayCaseAddressPart("o'fallon")).toBe("O'Fallon");
    expect(displayCaseAddressPart("L’AQUILA")).toBe("L’Aquila");
  });
  it("leaves longer apostrophe words and mixed case alone", () => {
    expect(displayCaseAddressPart("xi'an")).toBe("Xi'an");
    expect(displayCaseAddressPart("O'Fallon")).toBe("O'Fallon");
  });
  it("keeps inner d'/l' particles lower case", () => {
    expect(displayCaseAddressPart("coeur d'alene")).toBe("Coeur d'Alene");
    expect(displayCaseAddressPart("VAL-D'OISE", "region")).toBe("Val-d'Oise");
  });
});

describe("ownerNationalityClause", () => {
  it("calls a Hong Kong or Macau owner a permanent resident, never a citizen", () => {
    expect(ownerNationalityClause("Hong Kong", "Hong Kong")).toBe("is a Hong Kong permanent resident");
    expect(ownerNationalityClause("Macau", "Macau")).toBe("is a Macau permanent resident");
    expect(ownerNationalityClause("Macao", "Macau")).toBe("is a Macau permanent resident");
    expect(ownerNationalityClause("Hong Kong", "")).toBe("is a Hong Kong permanent resident");
    expect(ownerNationalityClause("Hong Kong", "Hong Kong")).not.toMatch(/citizen/);
  });

  it("does not infer permanent residency from residence alone", () => {
    expect(ownerNationalityClause("Philippines", "Hong Kong")).toBe(
      "is a citizen of the Philippines and a resident of Hong Kong",
    );
    expect(ownerNationalityClause("China", "Hong Kong")).toBe("is a citizen of China and a resident of Hong Kong");
    expect(ownerNationalityClause("", "Hong Kong")).toBe("is a resident of Hong Kong");
  });

  it("names a different country of residence for a Hong Kong permanent resident", () => {
    expect(ownerNationalityClause("Hong Kong", "United Kingdom")).toBe(
      "is a Hong Kong permanent resident and a resident of the United Kingdom",
    );
  });

  it("uses citizen-and-resident grammar for ordinary countries", () => {
    expect(ownerNationalityClause("Canada", "Canada")).toBe("is a citizen and resident of Canada");
    expect(ownerNationalityClause("Canada", "Singapore")).toBe("is a citizen of Canada and a resident of Singapore");
    expect(ownerNationalityClause("Canada", "")).toBe("is a citizen of Canada");
    expect(ownerNationalityClause("United Kingdom", "United Kingdom")).toBe(
      "is a citizen and resident of the United Kingdom",
    );
    expect(ownerNationalityClause("", "")).toBeNull();
    expect(ownerNationalityClause(null, undefined)).toBeNull();
  });
});

describe("countryForProse", () => {
  it("adds 'the' only where English prose needs it", () => {
    expect(countryForProse("United Kingdom")).toBe("the United Kingdom");
    expect(countryForProse("Netherlands")).toBe("the Netherlands");
    expect(countryForProse("Cayman Islands")).toBe("the Cayman Islands");
    expect(countryForProse("Hong Kong")).toBe("Hong Kong");
    expect(countryForProse("Canada")).toBe("Canada");
    expect(countryForProse("the Bahamas")).toBe("the Bahamas");
  });
});
