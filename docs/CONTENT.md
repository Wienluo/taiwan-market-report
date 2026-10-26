# Publishing content

The owner supplies updates in conversation. The site is a static reading interface.

## Daily and broker research

Keep dated article paths. Put source content in `div.article-content`; direct-child `h2` elements define chapters. Preserve source links and original publication dates. Shared `js/site.js` adds disclosure, summary, anchors and print; full articles still work without JavaScript.

Add new links to the corresponding archive index. Include common navigation/footer, `../css/style.css`, `../js/catalog.js` and `../js/site.js`. Deployment runs `tools/build_catalog.py` to update full-text search and the latest report cards automatically.

The current home has a human-written 2026-10-08 teaser. A newer daily report replaces it with its actual title, date and source excerpt.

## Personal market perspective

This section starts empty by user choice. Do not copy prior chat views into it. Publish only when the user provides or authorizes actual content.

Create `perspectives/YYYY-MM-DD.html`; for another version that day use an ordered suffix such as `-02`. Keep all prior files. Include the actual `time datetime="YYYY-MM-DD"`, truthful `h1`, full prose in `div.article-content` and common scripts/styles/navigation.

Set these HTML-escaped meta fields from the supplied view:

- `perspective-summary`: short overview.
- `perspective-market`: market judgment.
- `perspective-focus`: areas of attention.
- `perspective-risk`: main risks.
- `perspective-falsification`: conditions that change the view.

The catalog chooses the newest dated version. Home and the perspective page show its summary, four fields and full-article link. History retains all versions. Missing fields are labeled honestly. Never use a daily report date as an opinion update date.

## Classification

`tools/build_catalog.py` owns the company dictionary and twelve industry labels. Tags mean an article mentions that topic; they do not certify customer relationships, earnings or investment conclusions. New names remain searchable in full text before a dictionary entry exists.

## Verification

```
python3 tools/build_catalog.py
python3 tools/check_site.py
node --check js/site.js
node tests/site.spec.cjs
```

Python checks need no third-party packages. Integration tests require Playwright; `CODEX_PRIMARY_RUNTIME_NODE_MODULES` may locate it. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select installed Chromium. Verify browser reading, search and responsive behavior before publishing.

The builder emits lightweight `js/catalog.js` for reading pages and `js/research-catalog.js` with full text for the research page. Other pages do not download the entire search corpus.

The same build gives shared CSS and scripts a content-hash version in every HTML URL. Rebuilding after a content or design change prevents browsers from mixing a new page with cached older assets.

## Video research

Publish studies in `videos/YYYY-MM-DD-slug.html`, using the verified publisher/podcast date rather than the date an article was added. Maintain `videos/index.html` as a separate top-level archive and add its latest item to the homepage. The article needs direct-child `h2` chapter headings in `div.article-content`, regular shared navigation, and both shared scripts.

Add HTML meta attributes `video-topics` (pipe-separated canonical tags), `video-channel`, `video-speaker`, and `video-summary`. The catalog builder indexes `videos/` into kind `video` and stores multiple `topics` plus `channel`. The site JS supports multiple topic checkboxes (OR within topics; AND with text/month), date search, home preview, and the unified research database's video/topic filters.

Do not embed YouTube iframes or video players in research articles; provide a plain external link to the original video instead. Keep interview material, later Q&A, official competition performance, and academic evidence distinct. Never promote unverified promotional returns to independently verified statistics. State unclear original YouTube upload dates and partial-transcript limitations.
