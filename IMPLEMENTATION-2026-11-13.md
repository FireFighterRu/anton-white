# Portfolio refinement — 13 November 2026

## Selected changes from the supplied brief

- Clarified the hero offer and kept two actions: discuss the project / see work.
- Preserved the five demo concepts and prominent VECTOR feature; added short, verifiable capability lists to the other four cards.
- Replaced the former scope block with four compact price rows. Starting prices apply to explicitly limited scopes, not to every project shown in the portfolio.
- Added a compact inclusion/extra-work disclosure instead of another large section.
- Kept four delivery stages, with scope, contract, timing, revision and payment arrangements agreed before implementation.
- Updated FAQ and contact prompts; no mandatory form or invented lead-submission success.
- Centralized public contact settings in `docs/contact-config.js`. Email remains empty until a business address is chosen.
- Added an `aw:contact-intent` event hook without loading tracking services.
- Preserved demo disclosures and avoided fabricated reviews, sales results or guarantees.

## Responsive fixes and checks

- Mobile content remains visible without waiting for scroll reveal animations.
- Adjusted narrow-screen hero text, pricing rows, phone number, navigation gaps and content wrapping.
- Fixed VECTOR Bureau process-grid overflow and reorganized film controls for narrow screens.
- Kept horizontal gallery and film-chapter navigation intentional and bounded.
- Reviewed all 22 pages at 360 and 768 CSS pixels, plus the six project entry pages at 320/375 pixels. Fixed the Bureau overflow found during this review.
- Visually checked the final desktop price section and the film controls at 360 pixels.
- `node scripts/check-site.cjs`: 22 pages, 782 local links/assets, JavaScript syntax OK.
- `git diff --check`: no whitespace errors.

## Deliberately deferred

- Custom-domain canonical URLs, sitemap and final search-engine setup until a permanent domain is selected.
- Analytics counter activation until an actual counter and data-processing requirements are chosen.
- Collection forms and legal documents until the relevant business details and processing arrangement are available.
- No paid hosting, SSL or domain purchase was made during this update.

The Timeweb trial uses `cv534696.tw1.ru`; its panel does not list the technical domain as eligible for the free SSL order. Production HTTPS must be verified separately once a suitable domain is connected.
