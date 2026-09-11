# Claude handoff — Google Ads nomad locations, September 11, 2026

## Outcome: blocked on owner sign-in; no advertising changes made

The owner requested restricting Google Ads locations to places with high digital-nomad populations. The preceding website-performance task is paused. The in-app browser reached the Google Ads account sign-in page, not an authenticated account. The sign-in tab was shown and handed off for the owner to authenticate. No campaign settings, budget, status, ads, billing, or exclusions were changed.

## Scope and proposed execution

- Historical campaign: **Form5472 Filing Service**, ID **23875225330**, under the LuxuryAscent account. These identifiers come from the existing Google Ads diagnosis document, not current account verification. Other business campaigns are out of scope.
- After sign-in, inspect live campaign locations, exclusions, budget, status and location performance before selecting exact city targets. Historical budget notes conflict; do not treat the owner's earlier Facebook $15/day budget as the current Google Ads budget.
- Initial research shortlist: Lisbon, Bangkok, Mexico City and Tbilisi. Buenos Aires is a reserve; Chiang Mai, Da Nang, Kuala Lumpur and Dubai are additional evidenced hubs. This is a proposed list, **not saved targeting** or evidence of city-level conversion rates.
- Replace broad inclusions with the selected city-level targets only after inspecting the live account. Verify each location's exact name and type; earlier sessions documented misleading picker results.
- Use **Presence: people in or regularly in the targeted locations**, rather than Presence or interest. Presence is inferred, not a guarantee of physical location or digital-nomad status.
- Preserve existing exclusions and ensure India, Pakistan and Indonesia remain excluded, consistent with the owner's stated preference. Preserve current budget, bidding, keywords, ads, languages, networks and campaign status.
- Retain the campaign's existing Form 5472 intent filtering. Nomad density is not a proxy for foreign-owned U.S. LLC ownership or buying intent. Save only authorized geography changes, then reload and verify all locations/options and unchanged settings.

## Research evidence and limits

- [Nomads.com methodology and FAQ](https://nomads.com/faq): platform trip logs and modeled estimates support hub popularity, not census counts or purchase propensity. Candidate city pages corroborate community activity, including [Lisbon](https://nomads.com/digital-nomad-guide/lisbon), [Mexico City](https://nomads.com/digital-nomad-guide/mexico-city) and [Chiang Mai](https://nomads.com/chiang-mai).
- [Flatio's 2023 primary survey](https://www.flatio.com/blog/flatio-launches-its-first-digital-nomad-report-2023): older, platform-sampled corroboration for Portugal, Thailand, Argentina and Mexico; not current conversion data.
- [Google's advanced location options](https://support.google.com/google-ads/answer/1722038?hl=en) and [geographic targeting limitations](https://support.google.com/google-ads/answer/2453995?hl=en) explain presence versus interest and imperfect location signals.
- Research was delegated through Codex Orchestration to one bounded read-only native agent (requested Sol/high; tool accepted). Root inspected browser access and official Google documentation. No persistent model/routing configuration changed.

## Ownership, release and follow-up

| Checkout / branch | Owned files |
| --- | --- |
| Canonical `/Users/sumyeung/Documents/Codex/form5472`, `main` | This session note only |

Base commit: `1388ac2`. Resolve this documentation commit with `git log -1 -- docs/sessions/2026-09-11-google-ads-nomad-locations.md`. No website code or content changed, no production deployment attempted, and no live campaign change can be claimed. All pre-existing admin traffic edits and untracked files were preserved.

Owner action: sign in to Google Ads in the displayed browser tab and ask to continue. Then execute and verify the scoped location update and replace this blocked outcome with actual before/after evidence. Do not reactivate a paused campaign or raise its budget as part of this request.
