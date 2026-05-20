# SEO Deploy Checklist (Captain post-deploy actions)

These steps cannot be automated. Run them in order after the #27 PR is merged and GitHub Pages has deployed the new `robots.txt`, `sitemap.xml`, and `seo.json` plumbing.

1. Register at https://search.google.com/search-console — add property `https://ipachiu.me/` (URL-prefix, not domain).
2. Copy the verification token from GSC into `src/_data/seo.json` (the `googleVerificationToken` field).
3. Push the token change to `main` → wait for the GitHub Pages deploy to finish → return to GSC and click **Verify**.
4. In GSC: **Sitemaps → Add a new sitemap** → enter `https://ipachiu.me/sitemap.xml` → submit.
5. Register at https://www.bing.com/webmasters — use **Import from Google Search Console** to pick up the verified site automatically. (Fallback: if the import fails, register manually and paste the Bing token into `src/_data/seo.json` as `bingVerificationToken`; the `base.njk` template already supports an optional `<meta name="msvalidate.01">` tag.)
6. In Bing Webmaster Tools: **Sitemaps → Submit sitemap** → enter `https://ipachiu.me/sitemap.xml`.
7. (Optional) In GSC: enable email notifications under user preferences for indexing/coverage errors.
