# IndexNow

IndexNow is a protocol for pushing URLs directly to Bing for faster discovery.
Bing indexing also feeds Bing-powered surfaces including ChatGPT search, Microsoft Copilot, DuckDuckGo, and Yandex.

Run `npm run indexnow` to submit every URL from `https://www.form5472prep.com/sitemap.xml`.
Run `npm run indexnow -- --dry-run` to preview the sitemap URL count and first five URLs without posting.
Run `npm run indexnow -- --urls <comma-separated-urls>` to submit a specific subset instead of reading the sitemap.

The IndexNow key file is `public/93ddcc589b3e2a572c208e3628e1e545.txt`.
The key file content must exactly equal `93ddcc589b3e2a572c208e3628e1e545` with no trailing newline.
Real submissions require the key file to be live at `https://www.form5472prep.com/93ddcc589b3e2a572c208e3628e1e545.txt`.
That URL only works after the next production deploy.

Google does not support IndexNow and ignores it.
Use Google Search Console sitemap submission for Google indexing.
IndexNow only covers the Bing-powered engines listed above.
