import { describe, expect, it } from "vitest";
import { GOOGLE_ADS_TAG_ID } from "./googleAds";
import { googleAdsBootstrapScript } from "./googleAdsLoader";

// src/app/layout.tsx embeds the bootstrap as a raw inline <script> via
// dangerouslySetInnerHTML (no next/script). Anything that would end the script
// element early or open an HTML comment inside it would break every page.
describe("googleAdsBootstrapScript inline embedding", () => {
  it("is safe to place inside a raw <script> element", () => {
    const js = googleAdsBootstrapScript(GOOGLE_ADS_TAG_ID);
    expect(js.toLowerCase()).not.toContain("</script");
    expect(js).not.toContain("<!--");
    expect(js).toContain(JSON.stringify(GOOGLE_ADS_TAG_ID));
  });
});
