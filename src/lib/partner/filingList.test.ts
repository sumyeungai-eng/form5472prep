import { describe, expect, it } from "vitest";
import { pageCount, parsePartnerQuery, partnerFilingWhere } from "./filingList";

describe("parsePartnerQuery", () => {
  it("defaults to page 1, archived false, empty q, null status, null court", () => {
    expect(parsePartnerQuery({})).toEqual({
      q: "",
      status: null,
      page: 1,
      archived: false,
      court: null,
    });
  });

  it.each(["0", "-3", "abc", ""])("clamps page %s to 1", (page) => {
    expect(parsePartnerQuery({ page }).page).toBe(1);
  });

  it("accepts a valid page number", () => {
    expect(parsePartnerQuery({ page: "3" }).page).toBe(3);
  });

  it("treats an unknown status as null", () => {
    expect(parsePartnerQuery({ status: "NOT_A_STATUS" }).status).toBeNull();
  });

  it("accepts a valid FilingStatus", () => {
    expect(parsePartnerQuery({ status: "PAID" }).status).toBe("PAID");
  });

  it("treats archived=1 as true", () => {
    expect(parsePartnerQuery({ archived: "1" }).archived).toBe(true);
  });

  it("treats archived=true as true", () => {
    expect(parsePartnerQuery({ archived: "true" }).archived).toBe(true);
  });

  it("treats any other archived value as false", () => {
    expect(parsePartnerQuery({ archived: "0" }).archived).toBe(false);
    expect(parsePartnerQuery({ archived: "no" }).archived).toBe(false);
  });

  it("trims q", () => {
    expect(parsePartnerQuery({ q: "  acme  " }).q).toBe("acme");
  });

  it.each(["you", "client", "irs", "done"])("accepts a valid court %s", (court) => {
    expect(parsePartnerQuery({ court }).court).toBe(court);
  });

  it("treats an unknown court as null", () => {
    expect(parsePartnerQuery({ court: "nobody" }).court).toBeNull();
  });
});

describe("partnerFilingWhere", () => {
  const base = parsePartnerQuery({});

  it("always scopes to partnerId and hides archived by default", () => {
    expect(partnerFilingWhere("p1", base)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
    });
  });

  it("switches to partnerHidden:true when archived", () => {
    const query = parsePartnerQuery({ archived: "1" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: true,
    });
  });

  it("adds the OR search only for q length >= 2", () => {
    const shortQ = parsePartnerQuery({ q: "a" });
    expect(partnerFilingWhere("p1", shortQ)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
    });

    const longQ = parsePartnerQuery({ q: "acme" });
    expect(partnerFilingWhere("p1", longQ)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      OR: [
        { llcName: { contains: "acme", mode: "insensitive" } },
        { user: { email: { contains: "acme", mode: "insensitive" } } },
      ],
    });
  });

  it("adds status only for a valid FilingStatus", () => {
    const invalid = parsePartnerQuery({ status: "BOGUS" });
    expect(partnerFilingWhere("p1", invalid)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
    });

    const valid = parsePartnerQuery({ status: "PAID" });
    expect(partnerFilingWhere("p1", valid)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      status: "PAID",
    });
  });

  it("combines status, search and archived together", () => {
    const query = parsePartnerQuery({ q: "acme", status: "PAID", archived: "0", page: "2" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      status: "PAID",
      OR: [
        { llcName: { contains: "acme", mode: "insensitive" } },
        { user: { email: { contains: "acme", mode: "insensitive" } } },
      ],
    });
  });

  it("court=you matches PAID/PDF_GENERATED/FAILED plus DRAFT-without-invite", () => {
    const query = parsePartnerQuery({ court: "you" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      OR: [
        { status: { in: ["PAID", "PDF_GENERATED", "FAILED"] } },
        { status: "DRAFT", clientInviteSentAt: null },
      ],
    });
  });

  it("court=client matches SIGNATURE_PENDING plus DRAFT-with-invite", () => {
    const query = parsePartnerQuery({ court: "client" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      OR: [
        { status: { in: ["SIGNATURE_PENDING"] } },
        { status: "DRAFT", clientInviteSentAt: { not: null } },
      ],
    });
  });

  it("court=irs matches SIGNED_UPLOADED/FAXED with a plain status-in filter", () => {
    const query = parsePartnerQuery({ court: "irs" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      status: { in: ["SIGNED_UPLOADED", "FAXED"] },
    });
  });

  it("court=done matches CONFIRMED with a plain status-in filter", () => {
    const query = parsePartnerQuery({ court: "done" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      status: { in: ["CONFIRMED"] },
    });
  });

  it("court overrides a simultaneous status dropdown value", () => {
    const query = parsePartnerQuery({ court: "done", status: "PAID" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      status: { in: ["CONFIRMED"] },
    });
  });

  it("combines a court filter that itself uses OR (you/client) with a text search via AND", () => {
    const query = parsePartnerQuery({ court: "you", q: "acme" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      AND: [
        {
          OR: [
            { status: { in: ["PAID", "PDF_GENERATED", "FAILED"] } },
            { status: "DRAFT", clientInviteSentAt: null },
          ],
        },
        {
          OR: [
            { llcName: { contains: "acme", mode: "insensitive" } },
            { user: { email: { contains: "acme", mode: "insensitive" } } },
          ],
        },
      ],
    });
  });

  it("combines a court filter with a plain status-in (irs/done) with a text search directly", () => {
    const query = parsePartnerQuery({ court: "irs", q: "acme" });
    expect(partnerFilingWhere("p1", query)).toEqual({
      partnerId: "p1",
      partnerHidden: false,
      status: { in: ["SIGNED_UPLOADED", "FAXED"] },
      OR: [
        { llcName: { contains: "acme", mode: "insensitive" } },
        { user: { email: { contains: "acme", mode: "insensitive" } } },
      ],
    });
  });
});

describe("pageCount", () => {
  it("returns 1 for 0 total", () => {
    expect(pageCount(0)).toBe(1);
  });

  it("returns 1 for a total equal to the page size", () => {
    expect(pageCount(25)).toBe(1);
  });

  it("returns 2 when total exceeds the page size by 1", () => {
    expect(pageCount(26)).toBe(2);
  });
});
