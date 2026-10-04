# Part B — 3-4.md, 5.1.md, 5.2.md, 5.3.md, 6 all.md, Templates - Part 1.md

Conventions: [NEW] = not in COMPACT-KEYWORDS-PLAYBOOK.md, or only vaguely there (the new detail is stated). [IN-PLAYBOOK] = already captured.
Timestamps: 3-4.md and 6 all.md and 5.1.md carry running [hh:mm:ss] markers; I cite the nearest one as ~[mm:ss]. 5.2.md / 5.3.md / Templates have no timestamps, so I cite line numbers (L##).
Note: "3-4.md" is actually THREE lessons concatenated: (a) Lesson 3 "Who can use compact keywords" ~[00:00-13:00]; (b) Lesson 4 "Getting Technical" ~[13:00-41:00]; (c) SEO browser extensions / MozBar ~[41:00-58:00]. "6 all.md" is also three lessons: Information Architecture ~[00:00-19:00]; Image SEO ~[19:00-25:00]; Look Legitimate / trust ~[25:00-35:00].

---

## 3-4.md · Lesson 3 — Who can use compact keywords (everybody)

- [IN-PLAYBOOK] A compact keyword = bottom-of-funnel phrase written from the customer's problem/use-case perspective, usually without a brand name; blank volume is the signal. (src: 3-4.md ~[00:01-03:00])
- [NEW] Amazon/Temu-style example of the phrasing pattern: "keyboard cover for MacBook Air 13-inch" = person knows WHAT they want, not the brand. Use this as the sanity test for any candidate phrase: "would a buyer type this without knowing any vendor?" (src: 3-4.md ~[02:00-03:00])
- [NEW] Proof case 1 at low DA: SociableKit (DA 23) outranks Indeed itself for "embed Indeed jobs on a website" with a dedicated page at `/tutorials/embed-indeed-jobs-website`, plus a second page "embed Indeed jobs with an iframe" that also ranks. Pattern: one use-case page per phrasing variant; hub folder named `/tutorials`. Sturm is a paying customer who converted from exactly this page. (src: 3-4.md ~[03:00-05:00])
- [IN-PLAYBOOK] DA is not the gate (playbook cites ColorBliss DA 8, Reverb DA 19). New extra datapoints: SociableKit DA 23; "RiverPass" DA 29; "many sites I've seen under 10 or under 20 DA" rank for compact keywords; programmatic Chinese-workbook site DA 13 ranks. (src: 3-4.md ~[04:00], ~[39:00-40:00], ~[44:00])
- [NEW] AEO/GEO proof: asked ChatGPT "recommend voice recording for students" and it recommended Reverb using wording copied from Reverb's own page; Sturm's disclaimer: results vary run to run (same as Google), so test several times. Bottom-of-funnel exact-phrase pages are a hedge against AI because AI answers reuse customer-problem language. (src: 3-4.md ~[05:00-06:30], ~[12:00-12:30])
- [NEW] Top-of-funnel keywords are "a waste of time on a website" now (good only for brand building elsewhere); bottom-of-funnel is the website strategy. (src: 3-4.md ~[08:30-09:30])
- [NEW] Free backlink checker = Bing Webmaster Tools (shows backlinks to ANY site, ~1/4 the referring domains Moz shows). Useful to spy on competitors' link profiles at zero cost. (src: 3-4.md ~[07:00-08:00])
- [NEW] Social/video SEO side-lane (low relevance to us, but cheap): every platform is a search engine; YouTube Shorts with the how-to keyword in title+description got 100k views, 85% from search (scooter-trick example); Sturm titled a Short with "backlink checker" and it ranks. (src: 3-4.md ~[06:30-12:30])

## 3-4.md · Lesson 4 — Getting Technical (defensive SEO)

- [IN-PLAYBOOK] Technical SEO = defensive SEO; if crawl/dup/tags are broken, great BOFU pages still don't rank. (src: 3-4.md ~[13:00-15:00])
- [NEW] War story with a concrete cause to check for: a developer created a duplicate copy of the whole site (two live sites) -> Google confused -> rankings collapsed; removing the duplicate restored rankings with ZERO new pages. Check for staging/preview/duplicate hosts being indexed. (src: 3-4.md ~[14:00-15:00])
- [NEW] Another war story: site was invisible on Google only because it was never connected to Search Console. (src: 3-4.md ~[15:00])
- [NEW] AI chatbots also may be unable to read content that crawlers can't read — technical SEO matters for AI visibility too. (src: 3-4.md ~[15:30])
- [NEW] **Search Console property setup**: add the Domain property (root domain) AND every URL-prefix variant: `https://root.com`, `https://www.root.com`, plus http variants and any app subdomain (e.g. app.root.com). "Not a lot of people know this." (src: 3-4.md ~[17:00-18:00])
- [NEW] Confirm site is on HTTPS (ranking signal). (src: 3-4.md ~[18:00])
- [NEW] Sitemap mechanics: generate XML sitemap (his: post sitemap for articles + page sitemap for non-articles under a `sitemap_index.xml`); in GSC > Sitemaps submit BOTH the index and each child sitemap. (src: 3-4.md ~[18:00-19:30])
- [NEW] "Edward from the future" addendum: list the sitemap URL inside `robots.txt`; robots.txt = text file telling crawlers what they may access; view any site's via `/robots.txt`. (src: 3-4.md ~[19:30-20:30])
- [IN-PLAYBOOK] Request indexing per new/updated URL (GSC URL Inspection top bar > "Request Indexing"). New detail: sitemap + inbound links will eventually get it crawled anyway, so forgetting isn't fatal, but request indexing on every update too (not only new pages). (src: 3-4.md ~[20:00-21:30])
- [IN-PLAYBOOK] Bing Webmaster Tools (same flow; many believe it makes ChatGPT Search more likely to cite you). New detail: in Bing you do NOT need to submit every domain variant; it has URL Inspection + Sitemaps like GSC. (src: 3-4.md ~[21:30-22:30])
- [IN-PLAYBOOK] Screaming Frog free to 500 URLs (his paid plan ~$250/yr). New detail: can crawl a single subfolder, a subdomain, or one exact URL (use exact-URL mode to pull word count/H1 of one competitor page fast). (src: 3-4.md ~[22:30-24:30])
- [NEW] Screaming Frog audit recipe: filter to **HTML** (content pages); if your content pages don't appear but exist, you likely need server-side rendering (client-side-only is hard for Screaming Frog AND Googlebot "despite what Google says"; SSR is best practice; not an issue on WordPress/Webflow/Wix etc.). (src: 3-4.md ~[24:30-26:00])
- [NEW] Frog audit columns, in order: Status Code (filter 404 -> fix; 301 = intentional redirect e.g. trailing slash, affiliate links; 200 = OK) -> Indexability / noindex (review every noindex URL: did you mean it? Also find indexable junk you should noindex) -> Title (missing/nonsense on 200 pages) -> Meta Description (missing) -> H1 (none on a non-home page, or 2+ H1 = bad; check H1 > Occurrences). Homepage without H1 is tolerated. Export to CSV/Sheets. (src: 3-4.md ~[26:00-29:30])
- [NEW] Templates file lists a "Site Audit Template" Google Sheet for this lesson (contents not in transcript). (src: Templates - Part 1.md L5-7)
- [NEW] Page speed: his stance — PageSpeed Insights is "completely overrated"; LeewayHertz fails Core Web Vitals, 77/100 mobile, yet ranks great on competitive BOFU terms. Method: test by feel yourself, ask friends in different locations whether it feels slow, flush CDN cache before testing. Slow-feeling pages bounce -> Google demotes; conversely a good PSI score can still feel slow. (src: 3-4.md ~[29:30-37:00])
- [NEW] Page-speed best-practice list: use a CDN (Cloudflare; know how to flush its cache); compress images before upload (TinyPNG, also WP plugin); serve WebP; responsive image generation (smaller thumbnails to small screens — his 200 MB photo page loads fast because of it); keep plugins minimal. (src: 3-4.md ~[30:00-33:30])
- [NEW] WARNING: lazy loading is "very dangerous" — if implemented wrongly Google can't see the lazy-loaded content; only use if you know what you're doing. (src: 3-4.md ~[33:30-34:00])
- [NEW] Quick leak check: Google `site:yourdomain.com lorem ipsum` to find forgotten placeholder text (Ernst & Young has many). (src: 3-4.md ~[37:00-37:30])
- [NEW] Programmatic SEO primer: skeleton page + swapped terms from a database (Zapier "Connect Google Sheets to MailerLite" — use case in title + meta description, features auto-pulled from the app, "how Zapier works" block repeated; Zapier even outranks MailerLite for it; folder `/integrations/`). Also a "free Chinese workbook for beginners with printable PDF" site (DA 13) generated per-language and ranking. Guide referenced: Marc Lou "how to get customers with programmatic SEO". Only matters if you can code it. (src: 3-4.md ~[37:30-41:00])

## 3-4.md · SEO browser extensions / MozBar lesson

- [NEW] Extensions that show the same tags: MozBar (his choice), detailed.com extension, Ahrefs, Semrush toolbars. Use for QA of your own pages, competitor analysis, and niche understanding. (src: 3-4.md ~[41:30-43:30])
- [NEW] Reading the SERP overlay: per result Page Authority, Domain Authority, links to page/domain, root domains linking. Root-domain definition: 4 links from one site = 4 links, 1 root domain. DA = 0-100 ability to rank. (src: 3-4.md ~[43:00-45:00])
- [NEW] Link-profile guidance: want a MIX of high-, mid- and low-DA linkers; only-high-DA or only-one-type looks spammy. (src: 3-4.md ~[45:00-45:30])
- [NEW] Trust heuristic: keep DA visible beside the URL bar; a "successful business with big blog" at DA <10 is likely lying; a banking/PII site with very low DA may be a typo-squat phishing clone. (relevant: our visitors may check us the same way) (src: 3-4.md ~[46:00-47:30])
- [IN-PLAYBOOK] The five fields to care about: URL, page title, meta description, H1, alt text (playbook has them). New detail below. (src: 3-4.md ~[57:00-58:00])
- [NEW] Google no longer shows your full title/description (it rewrites); DuckDuckGo more likely shows the full title. Still write them as if they will appear. (src: 3-4.md ~[48:00-48:30])
- [NEW] Meta keywords tag: dead, ignore. (src: 3-4.md ~[49:00])
- [NEW] H2/bold/italic are shown in the MozBar Page Analysis tab; alt text strategy: keyword in alt of FIRST image only, then descriptive, page-relevant alt on later images (examples: "a recording of vocabulary exercises", "recording share links"). Alt text also shows when image fails to load. (src: 3-4.md ~[49:30-51:00])
- [NEW] Index/follow: no robots tag = default index,follow; best practice is to state `index, follow` explicitly. Check canonical = self-URL on the original page. (src: 3-4.md ~[50:30-52:00])
- [NEW] Follow vs nofollow: followed links pass link equity, nofollow don't but still have value; Google now cares less about the distinction. Social platforms give nofollow; blogs usually follow. The follow/root-domain counters in MozBar are noisy (a link repeated sitewide by a badly coded site inflates "total links") — ignore totals; use Moz Link Explorer / Ahrefs for real analysis. (src: 3-4.md ~[51:00-54:00])
- [NEW] Debug Open Graph/social previews with the **Facebook Sharing Debugger**, not the MozBar markup tab. (src: 3-4.md ~[54:00])
- [NEW] MozBar "HTTP status" tab shows redirects live (e.g. trailing-slash 301; he 301s memorable vanity domains to long affiliate URLs). (src: 3-4.md ~[54:30-55:30])
- [NEW] MozBar "Link" tab highlights followed/nofollowed/internal/external links. He passes juice to Unsplash/Pexels on purpose, uses nofollow only on affiliate links (ToS: don't look like you're paid for followed links). (src: 3-4.md ~[55:30-57:00])
- [NEW] Moz On-Page Grader is saved for its own lesson (-> see 5.3 below). (src: 3-4.md ~[57:00])

---

## 5.1.md · On-page SEO for bottom-of-funnel landing pages

Models studied: Reverb Record (his own), Bitrix24 `/uses`, LeewayHertz (services; "web3 development company" page scores 97/100).

- [IN-PLAYBOOK] Keyword in URL, start of title, meta description, H1, beginning of first sentence (+ often first-image alt). New: he cites the exact LeewayHertz recipe (URL `web3-development-company`; title starts "Web3 Development Company"; description "We are the leading Web3 development company for enterprises and startups…"; H1 same) and says "when you rank high for one BOFU keyword you rank for many others". (src: 5.1.md ~[01:00-03:00])
- [NEW] Page-title format: `<keyword> | <Brand>` using a vertical bar divider ("learned doing SEO for the biggest companies; looks professional"); applies to all pages on all his sites; automate separator + brand in the SEO plugin (Yoast). Use the product name as brand when the tool differs from company ("Reverb Record" not "Reverb"). (src: 5.1.md ~[03:00-05:00])
- [NEW] Optional conversion lever in the title: `<keyword> | <CTA/benefit> | <Brand>` e.g. "Voice recording for students | Free, no signup required | Reverb Record". He accepts the brand being truncated in the SERP (tool says title >600 px) because the benefit stays visible; alternative short CTA "Record now" fits completely. NOTE: this conflicts with the playbook's hard ≤60-char title rule — decide per page; keep keyword first either way. (src: 5.1.md ~[05:00-08:00])
- [NEW] A second keyword can ride in the title: LeewayHertz title "Web3 Development Company | Web3 Development Services" targets the sibling phrase and adds description for searchers. (src: 5.1.md ~[07:30-08:00])
- [NEW] Use a SERP-preview tool (pixel-width based, e.g. totheweb-type snippet previewer) when drafting titles/descriptions. (src: 5.1.md ~[05:30-06:30])
- [IN-PLAYBOOK] Keyword at the START of meta description and at start of first sentence (helps searchers recognise the page is for them). (src: 5.1.md ~[08:00-09:00])
- [IN-PLAYBOOK] Writing style: short punchy sentences; paragraphs 1-3 sentences (usually 1); liberal bullets; neutral tone, no sensationalism ("deadly, ruins, war zone"), no superlatives ("best", "greatest"). New: he allows emphasis of features ("the perfect recording app", "free and instant", "completely free") but never "the best/most"; and the stated reason is that neutral writing converts better AND is more likely to be picked up by ChatGPT/Gemini for recommendation queries. (src: 5.1.md ~[09:00-12:30])
- [NEW] Does NOT use bold/italics to emphasise keywords; bold only what you'd genuinely emphasise. (src: 5.1.md ~[02:30-03:00])
- [IN-PLAYBOOK] Word count ~415 (400-500 range; Screaming Frog counted 472 incl. headings; also saw 250-word and shorter pages at #1, and much longer pages at #1). CAUTION: playbook's on-page checklist says 900-1,000 words; Sturm's own number is 400-500. (src: 5.1.md ~[13:00-14:00])
- [NEW] Page skeleton as taught: (1) H1; (2) a few-sentence intro (keyword first); (3) big CTA button; (4) H2 sections with copy+image; (5) closing CTA identical to top (same destination). (src: 5.1.md ~[14:00-15:00], ~[19:30-20:00])
- [NEW] He writes copy himself (or hires a writer) — does NOT use generative AI for page text: "tons of webmasters caught with AI-generated SEO pages and penalised", he plays the long game; also needs creativity to connect a keyword to the brand's real functionality. Possible future automation he describes: feed brand documentation to an AI + bank of approved screenshots/images, then a human proofreader intimate with the brand reviews every page. (src: 5.1.md ~[14:30-18:00])
- [NEW] Section visual rhythm: alternate image-right/copy-left, then image-left, then no-image centred section; dividing lines between sections; reusable saved sections in the page builder; use screenshots, GIFs, an embedded video, link out to relevant assets (e.g. Chrome extension). Prefers MANY images (helps readers and algorithms). (src: 5.1.md ~[18:00-19:30])
- [NEW] **Mobile layout rule**: H1 -> intro -> CTA button -> THEN the hero image (image goes BELOW the CTA); for later sections the image goes after the section text. Most important: hero image below the CTA on mobile. (src: 5.1.md ~[19:30-20:30])
- [NEW] LeewayHertz model: pages 'so long' only because they reuse sections — unique copy is small. Reused blocks: engagement models, "Get started today", FAQ, client-logo strip (ESPN, Hershey's) for trust, explanatory blocks per topic cluster; populated by CMS **tags** (a section appears on any page carrying the tag; edit once, changes everywhere). (src: 5.1.md ~[20:30-25:30])
- [NEW] Hero rule when reusing sections: the top section's image must be directly relevant to the keyword (needn't be unique) and the copy must be keyword-specific (LeewayHertz: "As an experienced Web3 development company…"). (src: 5.1.md ~[21:30-22:00])
- [NEW] Bitrix24 groups several close keywords on one page (e.g. "free project management reporting tools" -> "free task management software"); Sturm prefers ONE keyword per page when starting, several only when the group is equally non-competitive. (src: 5.1.md ~[22:00-23:00])
- [NEW] **80/20 rule for reused-section pages**: put ~80% of the page's keyword-unique copy/images near the TOP (visitor must see within seconds it's tailored); don't put all of it up there — spread some down the page so it looks authentic. Seen failure: unique copy buried at the bottom -> bounce. (src: 5.1.md ~[27:30-29:30])
- [NEW] Awkward-keyword rule: if the exact phrase reads clunky ("students record themselves reading"), keep it in the URL slug (`/uses/students-record-themselves-reading`) but make H1+title natural ("Have Your Students Record Themselves Reading"); Google can tell clunky titles; accept a slightly lower Moz score for authenticity; often you can still use the keyword verbatim in H1/title/slug. That page ranks #1. (src: 5.1.md ~[29:00-30:30])
- [NEW] Effort/time benchmark: keyword found + ~475 words + reused images = one afternoon (a few hours); submitted to GSC, linked from the `/uses` hub, in sitemap; "took a few months, then ranked" and stays #1 for years. (src: 5.1.md ~[26:30-27:00], ~[30:30-31:30])
- [NEW] Reusable-section editing (CMS-dependent): edit one section -> edit all pages — worth doing once you have many pages. (src: 5.1.md ~[31:30-32:00])
- [NEW] You can hire a writer; copy is easy once the pattern is understood. (src: 5.1.md ~[32:00])

---

## 5.2.md · Bottom-of-Funnel SEO Landing Page Template (Google Doc; usable as Word/Pages)

Template link is in Templates - Part 1.md L11 (the doc text itself is not in the transcript; the section order below is rebuilt from the narration, L13-43).

**Section order, verbatim as narrated (L13-43):**
1. Document title: "Template Keyword, Keyword 1, Keyword 2, Keyword 3" — replace "Template Keyword" with the PRIMARY keyword; list the secondary keywords after it (document title = list of target keywords; for organisation only).
2. Keyword list in the body ("I list out the keywords here"). Typically 1-3 keywords per page; more than 3 only if clearly obtainable.
3. URL (e.g. the page slug)
4. Page title (`keyword | brand`)
5. Meta description (keyword first)
6. H1 = the primary keyword
7. Intro: "your first sentence should use the keyword and have it positioned near the beginning of the sentence"; ~3 sentences
8. Call-to-action button (SaaS example: "Record now"; services example: "Contact us" button to a dedicated form page)
9. Sections, each = H2 title + copy (placeholder "Lorem ipsum" replaced by your copy); as many H2 sections as you want (placeholders, add/remove freely)
10. The same call-to-action button again at the bottom
11. (Note inside doc) specify which sections are reused sections.

- [IN-PLAYBOOK] The whole template (playbook §5 reproduces it, incl. CTA right after intro and repeated at the bottom). (src: 5.2.md L13-43)
- [NEW] Why write in a doc first: organisation — lets you see/reuse copy from earlier pages and compare with the live page; images are chosen AFTER copy (copy first, then pull from media library or create images). (src: 5.2.md L19-21, L47-55)
- [NEW] Page's keyword list at the top uses sibling phrasing ("students record their voice") — secondary keywords are close variants of the primary, not different topics. (src: 5.2.md L23-27)
- [NEW] Rationale quote: rank #1 for one keyword => usually rank for lots of similar ones and get "a lot more traffic than the SEO tools say". (src: 5.2.md L25)
- [IN-PLAYBOOK] Short punchy copy, one-to-three-sentence paragraphs, bullets. (src: 5.2.md L49-53)
- [NEW] Information-architecture examples named in this lesson: `reverb.chat/uses/...`, `bitrix24.com/uses/...`, hypothetical `leewayhertz.com/services/...`, `/alternatives/` hub ("control the narrative": captures searches for alternatives to competitors AND to you; e.g. "Slack compared to …"). (src: 5.2.md L59-67)

---

## 5.3.md · Critical optimisations with the Moz On-Page Grader

- [IN-PLAYBOOK] Use the grader against the target keyword; aim for 96-98; 100 can be over-optimised (he de-optimised from 100 to 98 by removing the keyword from alt text or using a variation not the exact keyword in the first sentence, and the page ranked better). (src: 5.3.md L41-47)
- [NEW] Grader can be run on a page that targets a DIFFERENT keyword to tell you what to change (his example: page written for "voice recording for students", test against "voice recording for lawyers"). Also usable on competitor pages while browsing. (src: 5.3.md L19-21, L51)
- [NEW] Two access routes: (a) Moz web app > On-Page Grader (more detailed, with explanations of why each factor matters and how to fix, "smiling avatars" for good/bad); (b) MozBar > "Page Optimization" > enter keyword > Optimize > "See all optimization factors". (src: 5.3.md L23-37, L49-51)
- [NEW] Grader recommendation wording captured: use targeted keyword at least once in the document text; add some form of the keyword EARLY in the title tag, preferably as one of the first words; exact keyword preferable; move keyword closer to the beginning of the title tag, preferably first. Output is split into factors helping vs hurting; page score rises as you fix them. (src: 5.3.md L29-39)
- [NEW] **Constraint: the On-Page Grader will re-check a given page only once per day** — apply fixes, wait until the next day to re-grade. (src: 5.3.md L95-97)
- [NEW] Observation: BOFU pages that rank well also have high page scores — compare at a glance in MozBar **SERP Analysis** (each result's page score). (src: 5.3.md L55)
- [IN-PLAYBOOK] Read the SERP by page score, not difficulty ("I don't look at the difficulty scores… I prefer my own eyes"). New examples: "web 3 development company" = competitive (LeewayHertz needed backlinks to that page; its PA good though DA lower); "voice recording for lawyers" = wide open: high-DA results but terrible page scores, nobody targets it. (src: 5.3.md L55-65, L85-93)
- [NEW] Research workflow for a new page (e.g. "voice recording for lawyers"): ask ChatGPT to list how that audience uses the product, skim top-ranking third-party pages ("top five ways lawyers use dictation technology") for use-case ideas, then rewrite in own language and target the keyword exactly; ~an afternoon of work. (src: 5.3.md L65-69)
- [NEW] Expected trajectory: on an open SERP you reach page one within the first week/month of publishing; then Google promotes the page by engagement — searchers who click, don't bounce back to the SERP and don't keep searching push you up over a few months to #1; once #1 it "stays number one for years". Page must truly satisfy the searcher (relevant copy, tool usable immediately). (src: 5.3.md L61, L71-79, L93)
- [IN-PLAYBOOK] After grading, submit/re-request indexing in Search Console (URL in top bar; "Request indexing" for new or updated pages, also if Google crawled it mid-edit). (src: 5.3.md L99-105)
- [NEW] He no longer needs the grader (internalised the rules); it is a QA/learning tool, useful if you have little on-page experience. (src: 5.3.md L7-13)

---

## 6 all.md · Lesson: Information architecture (IA)

- [NEW] Definition used: IA = organising, arranging and labelling site content — navigation, categorisation, hierarchies, sitemaps. (src: 6 all.md ~[00:30])
- [IN-PLAYBOOK] Orphan pages are bad; page linked only from the sitemap tells Google you're hiding it/it's unimportant. New phrasing: "if a URL you want to rank is only linked from the sitemap, that's no good". (src: 6 all.md ~[01:00-03:00])
- [IN-PLAYBOOK] Fewer clicks from homepage = more importance; BOFU pages 2 clicks best, 3 ok, >3 risky. New: the exception is blog/article pagination (Google understands paginated archives; page-4 article isn't penalised) — the click-depth rule is specifically for BOFU landing pages. (src: 6 all.md ~[03:00-04:30])
- [IN-PLAYBOOK] Check crawl depth in Screaming Frog (Crawl Depth column; homepage = 0). New: you can also crawl COMPETITORS and look up how many clicks their ranking BOFU pages sit from the homepage; search the HTML filter by page name. (src: 6 all.md ~[04:30-06:00])
- [IN-PLAYBOOK] Hub page in footer under "Resources" -> hub -> child pages (Bitrix `/uses`, `/alternatives`; Reverb `/uses`). New: footer placement/organisation "actually matters". (src: 6 all.md ~[06:00-08:30])
- [NEW] LeewayHertz variation: services reachable via header menu (Services > Web3 > page) AND repeated in footer under Services; still max 2-3 clicks. So link the same BOFU page from nav + hub + footer. (src: 6 all.md ~[06:30-07:30])
- [NEW] Hub name options with his stated use: `/uses` (products, applies to most businesses), `/alternatives` (competitor brand searches; pages named like "Free <Competitor> alternative"), `/solutions` (very general: services, SaaS, products), `/services` (services business), `/software` or `/software-recommendations` (affiliates; CTA contains the affiliate link), SociableKit uses `/tutorials`. You may have several hubs, all linked from footer Resources. (src: 6 all.md ~[08:30-12:00], ~[17:30-18:30])
- [NEW] Hub name appears in three places: URL subfolder, hub H1, and (his style) title `Uses | Brand`; the hub is its own indexable page (the H1 = hub name), child pages are nested under the subfolder. Hub title gives CONTEXT to the keywords of its children. (src: 6 all.md ~[08:00-10:30])
- [IN-PLAYBOOK] Hub must look real and styled (not a bare list) — "Google's gonna see that… trying to game Google". New: his own hub = styled background, intro text, H1, clonable panels; headings H1 > H2 (categories) > H3; Bitrix categories: CRM, project management, forms, workspace, invoicing, intranet, apps; LeewayHertz categories: generative AI, AI/ML, data engineering, Web3, blockchain, software development. (src: 6 all.md ~[12:00-13:30])
- [IN-PLAYBOOK] Category H2s give context and need not link anywhere; anchor text = child page's H1 (vary occasionally). New: the exact keyword may differ from the H1 (keyword "students record themselves reading" vs H1/anchor "Have your students record themselves reading"); Google reads surrounding text and anchor text. (src: 6 all.md ~[13:30-15:00])
- [NEW] Close every hub with a CTA + one trust line (Reverb: "Stop typing, send Reverbs… Record now"; Bitrix: "15 million+ organisations have chosen Bitrix24. Start for free"). (src: 6 all.md ~[15:00-15:30])
- [NEW] IA planning template (Internal SEO Template > "Information Architecture" tab): brainstorm tree Footer > Resources > Uses > Category > Page; same for top navigation (Uses in header -> hub -> category -> page = 2 clicks). (src: 6 all.md ~[15:30-17:30]; Templates - Part 1.md L13-15)
- [NEW] Extra-importance move: place all (or the top) BOFU pages DIRECTLY in the footer so they're 1 click from home, while still keeping the hub (SociableKit: tutorials hub linked in header + many pages also in footer). (src: 6 all.md ~[17:00-19:00])

## 6 all.md · Lesson: Image SEO

- [NEW] Images ranking in Google Images (and in main results) for the same keywords: Reverb's hero image ranks in Image search for "voice recording for students" and "student voice recorder" (#1 both). Google reads image/video FILE NAMES (also YouTube uploads). (src: 6 all.md ~[19:00-20:30])
- [NEW] **File-name convention mirroring IA**: `<hubsubfolder>_<page-slug-with-dashes>.webp` for the hero image (e.g. `services_nyc-website-migration-seo-services`); other images: add another underscore + descriptive part (`services_nyc-website-migration-seo-services_seo-traffic-increase-post-migration`), consistent with the alt text. (src: 6 all.md ~[20:30-22:30])
- [IN-PLAYBOOK] Keyword in alt text of the FIRST image only (avoid over-optimisation; exception when the keyword is so short you can't avoid it). New: other images get descriptive alt text relating the image to the page's topic. (src: 6 all.md ~[21:30-22:30])
- [NEW] If the same image appears on several BOFU pages (not as a shared reusable section): RE-UPLOAD it per page with a unique, page-relevant file name and unique alt text. Hero image may be the same picture on many pages but must be uploaded separately with page-specific name + alt. (src: 6 all.md ~[22:30-24:00])
- [NEW] Alt text = directly relevant to the page's performance ("alt text is key too"); use small files: WebP (convert PNG->WebP with a free converter), TinyPNG for compression (WP plugin auto-compresses uploads); slow images -> bounce -> hurts rankings. (src: 6 all.md ~[24:00-25:30])

## 6 all.md · Lesson: Making the company look legitimate (trust)

Purpose stated: trust raises conversion and lowers bounce, and "designed so you need less backlinks / less DA to rank".

- [NEW] Basics list: Terms of Service/Terms of Use page and Privacy Policy, both linked in footer. (src: 6 all.md ~[26:00-26:30])
- [NEW] Services business: publish Name-Address-Phone (NAP) on the site and keep it IDENTICAL across all directories ("Google hates seeing inconsistencies"); non-services: a contact page with consistent contact details (phone optional; need some way to reach you). (src: 6 all.md ~[26:00-27:00])
- [NEW] Directories double as link building / DA growth (details in a later lesson, not in my files) — keep listing details consistent. (src: 6 all.md ~[27:00-27:45])
- [NEW] Social profiles linked from the footer ("shows you're a real company"). (src: 6 all.md ~[27:30])
- [NEW] A small blog (LeewayHertz calls it "Insights"): a few short articles you write yourself (not ChatGPT), spend ~an afternoon total; link it in header/footer; add a few more as the number of BOFU pages grows; use it as the place to put outbound links. Not a key tactic, just trust. (src: 6 all.md ~[27:30-29:00])
- [NEW] **Outbound link experiment**: 10 domains, same keyword, same content; 5 link out to external sites (3 followed outbound links each), 5 don't — the linking-out group ranks above. Advice: use dofollow outbound links, especially to high-DA sites; if you link to nothing, find excuses (blog) to do it. Needn't be on BOFU pages. (src: 6 all.md ~[28:30-30:00])
- [NEW] Design: clean, wide margins/white space, consistent branding; cluttered/slow/ugly = bounce. Quoted line on white space = luxury/trust (Apple, Tesla, Google). (src: 6 all.md ~[29:30-32:00])
- [NEW] Addendum — Google API leak (May 2024), via a WordStream article: (1) Google DOES use Chrome data; Sitelinks under a brand search come from Chrome click/engagement data (Chrome ~66% share); "a site your users love, even if they find it through other means, is good for SEO" (traffic + engagement). (src: 6 all.md ~[32:30-33:45])
- [NEW] Addendum — "original content score": pages with LITTLE content get an originalityContent score; the less content, the more original it must be (no char-count metric, but short pages need an added dose of authenticity). Implications he draws: blog posts not AI-written; on BOFU pages that reuse sections, keep a good chunk original and keyword-tailored; use reusable sections that actually SELL (client logos, appearances, metrics, features spun toward the keyword). (src: 6 all.md ~[33:45-35:00])

---

## Templates - Part 1.md · Index of the course's Google Docs/Sheets (links only; content not in my files)

- [NEW] Lesson 4: Site Audit Template (sheet). Lesson 5: Bottom-of-Funnel SEO Landing Page Template (doc). Lesson 6: Internal SEO Template — Information Architecture tab. Lesson 7: Competitor Keywords Template; Internal SEO Template — Keywords tab. Lesson 8: Internal SEO Template — Site SEO Layout tab. Lesson 11 (no-website ranking): IG Reels/TikTok tab; YouTube tab. Lesson 12: Directory SEO Template. These names reveal the course's data model (one workbook with tabs: IA, Keywords, Site SEO Layout, social tabs) worth mirroring in our own tracking sheet. (src: Templates - Part 1.md L5-35)

---

## Counts

Bullets tagged [NEW]: 84. Bullets tagged [IN-PLAYBOOK]: 23 (several of these also carry a smaller "new detail" clause).

## Top 15 NEW items most applicable to a low-DA niche B2B tax-filing service site (form5472prep.com) — ranked

1. **80/20 unique-copy rule** — when pages share reused blocks (FAQ, penalties, process), put ~80% of the keyword-specific copy/images in the top screen so visitors from "Form 5472 for [owner type]" searches see a tailored page instantly and don't bounce (5.1 ~[27:30]).
2. **Original-content score + write it yourself** — short BOFU pages are judged on originality; don't AI-generate page copy, and make reused sections sell (logos, metrics, guarantees); critical for a YMYL tax site where AI-flavoured text erodes trust (6 all ~[33:45]; 5.1 ~[14:30]).
3. **Trust/legitimacy bundle** — ToS + privacy in footer, consistent NAP/contact details, social profiles, a small self-written blog, visible DA; tax filing is a high-trust purchase and Sturm says this reduces the links needed to rank (6 all ~[26:00-29:00]).
4. **Dofollow outbound links to authority sources** (IRS.gov instructions, Delaware/state sites) — the 10-domain experiment showed linkers outrank non-linkers; costs nothing and fits our compliance content (6 all ~[28:30]).
5. **Hub in footer + top BOFU pages linked directly from footer** — `/services` hub under Resources plus the 5-10 money pages in the footer gives 1-click depth, extra importance; hub must be styled with H2 categories and a closing CTA (6 all ~[17:00]).
6. **Programmatic skeleton pages with swapped terms** (owner country, LLC state, filing-year/late-filing situation) — Zapier/DA-13 examples rank at low DA; combine with rule 1 so each page has unique top copy (3-4 ~[37:30]).
7. **Awkward-keyword handling** — keep the exact phrase in the URL slug, make H1/title natural when the phrase is clunky ("late Form 5472 foreign owned LLC"); accept a lower Moz score for authentic copy (5.1 ~[29:00]).
8. **CTA/benefit inside the title between keyword and brand** — e.g. "keyword | flat fee, no CPA call | brand"; he tolerates truncation to keep the benefit visible (note: conflicts with ≤60-char rule, so A/B per page) (5.1 ~[05:00-07:30]).
9. **Image SEO naming** — `services_<slug>_<descriptor>.webp`, re-upload shared images per page with unique file name/alt, keyword in first-image alt only; cheap extra Google Images/AI-citation surface (6 all ~[20:30-24:00]).
10. **Neutral, no-superlative tone for AI pickup + test in ChatGPT** — Sturm saw ChatGPT recommend his page using its own wording; re-ask the target phrase in ChatGPT repeatedly to measure; also connect Bing Webmaster (no need for domain variants) (5.1 ~[11:00]; 3-4 ~[05:30], ~[21:30]).
11. **`/alternatives` hub ("Free X alternative")** — capture searches for competitors (Doola, Firstbase, Northwest, Tax1 etc.) and for us; controls the narrative and these are near-bottom-of-funnel (6 all ~[07:00-09:00]).
12. **Open-SERP judgment + research workflow** — pick keywords where DAs are high but page scores terrible; use ChatGPT/competitor pages only for ideas and rewrite in own words; expect page-one in weeks and #1 over months with no rewriting (5.3 L55-79).
13. **Technical audit order & traps** — GSC domain + URL-prefix properties, sitemap index + sitemap in robots.txt, Frog filters (HTML > status 404/301 > indexability/noindex > title > meta > H1 occurrences), `site:domain lorem ipsum`, SSR/content-visible check, never lazy-load key content, judge speed by feel not PSI (3-4 ~[17:00-37:30]).
14. **Grader practicalities** — Moz On-Page Grader re-checks a URL once per day (stage your fixes), 96-98 target, can test the live page against a different keyword, and the web-app version gives the fix explanations (5.3 L95).
15. **Mobile/section layout** — H1 > intro > CTA > hero image on mobile; alternating image/text sections with dividers; identical CTA top and bottom; services CTA = "Contact us"-style button to a dedicated form page (for us: start-filing/intake) (5.1 ~[19:30-20:30]; 5.2 L39-41).
