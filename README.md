# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## SEO and Analytics setup

- Base URL: set `NEXT_PUBLIC_BASE_URL` (e.g., `https://theseonproject.com`).
- Google Search Console: add `GOOGLE_SITE_VERIFICATION` to inject the meta tag automatically.
- GA4: set `NEXT_PUBLIC_GOOGLE_ANALYTICS` (e.g., `G-XXXXXXX`). The cookie banner will only enable analytics after consent.
- Sitemap: available at `/sitemap.xml`; ensure it’s submitted in Google Search Console.
- Robots: `/robots.txt` is generated with the correct `Host` and `Sitemap` entries.

Recommended next steps:

1. Verify your domain in Google Search Console (Domain property) and submit `/sitemap.xml`.
2. Enable site search tracking in GA4 and monitor Core Web Vitals in GSC.
3. Add content regularly around AI companions and Zero UI; internal link between related pages.
