---
version: alpha
name: "MARKET NOTE"
description: "A personal research notebook for Taiwan equities."
colors:
  primary: "#176b65"
  background: "#f0f5f6"
  paper: "#ffffff"
  ink: "#20394d"
  muted: "#5d727d"
  tint: "#e6f1ee"
  rule: "#d5e1e4"
  soft: "#f8fbfa"
typography:
  sans:
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif'
  serif:
    fontFamily: '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
rounded:
  DEFAULT: "8px"
  sm: "5px"
  md: "7px"
  lg: "10px"
spacing:
  section-gap: "32px"
  page-max: "1040px"
components:
  button: {}
  card: {}
  disclosure: {}
  search: {}
  table: {}
---

# MARKET NOTE Design System

## Overview

### Creative North Star

A personal research notebook on a bright desk: cool gray surroundings, navy type, restrained teal rules. The user approved the rendered design on 2026-10-10. Their own perspective leads; daily and broker research support it.

### Product context and register

- Audience: primarily the owner, reviewing evidence and prior judgments.
- Locale and market: Traditional Chinese, Taiwan equities; useful English names remain. Report dates are date-only Taiwan trading dates, never converted to viewer timezone.
- Usage: desktop and phone equally important; short summaries then full text.
- Register: editorial content site with a local searchable archive; no accounts, CMS or trading actions.
- Signature: personal view with a teal left rule and a four-row summary.
- Restraint: readable tables, real links, native controls.
- Anti-references: dark trading terminals, promotional landing pages, ornamental charts, dense dashboard tiles, gradients and dramatic shadows.
- Token ownership: Model B. `css/style.css` is canonical; this document mirrors it. Colors map to `--accent`, `--bg`, `--paper`, `--ink`, `--muted`, `--tint`, `--rule`, `--soft`; fonts to `--sans` and `--serif`. Update both together. No separate theme adapter.

## Colors

Teal denotes navigation, focus and the perspective rule, not a bullish rating. White holds content; soft tint holds the perspective summary. Navy primary text, blue gray supporting text, thin borders. One light theme; forced colors use platform colors. Financial ratings retain their original text.

## Typography

31px serif page headings, 27px on phones; 15px sans body with article leading 1.9. Metadata 12px, controls 13px, tables 13px with tabular numbers. Chinese system fallbacks avoid external font loading and shifts. Brand is Georgia, 20px desktop / 18px phone. Serif expression stays in page headings and the personal empty statement.

## Layout

1040px pages, 900px article pages, 1120px header. Insets 32px desktop, 20px phone, 14px below 350px. Personal panel is two columns, then daily/broker split 1.4:1; both stack below 680px. At 800px navigation gains a row and filters become two columns. Document owns vertical scroll; wide tables own horizontal overflow. No fixed-height content traps.

## Elevation & Depth

White and soft surfaces, 1px rules. No shadows, blur, decoration or sticky headers. Print removes chrome and opens all chapters.

## Shapes

5px controls/tags, 7px chapters, 8px cards, 10px personal panel. Thin rules and quiet rectangles. Tags must not resemble purchase buttons.

## Components

### Foundational visual states

Teal 3px focus ring with 4px offset, tint hover, darker pressed primary. Selected navigation uses tint plus weight. Empty views describe future content without fabricating dates. Catalog failure gives archive links; no results gives reset. Local synchronous search needs no loading spinner.

### Buttons and actions

Solid primary for reading/search; outlined neutral for expand/collapse/reset/load more; text links for secondary navigation. Buttons perform actions; anchors navigate. No editing or destructive actions. Shared CSS across routes.

### Navigation and data display

Five links: home, personal views, daily reports, broker reports, research archive. Preserve article URLs. Native details chapters: daily market overview and final judgment initially open; broker first and final chapters initially open; anchors open their destination. Semantic tables have keyboard-accessible horizontal scrolling and visible scrollbars. Catalog shows 12 results then explicit load more, reset by filter changes.

### Forms and overlays

Local full-text search, real label, explicit clear, Enter submit, IME safety. Native selects intentionally use OS popups. Company, industry, kind and month combine. URL retains query/filters; back/forward restores them. No dialogs, calendar, editor or notifications.

### Iconography

Text arrows for navigation, plus/minus for disclosure. All actions have text labels. No icon library.

### Motion

No decorative animation; native disclosure and natural scrolling. Respect reduced motion.

### Content and data visualization

Plain Traditional Chinese, original dates and source links. Tags classify article mentions, not confirmed commercial exposure or investment ratings. Personal opinions require user-supplied content, retain prior versions and show actual publication dates. No synthetic charts.

## Do's and Don'ts

- Do put personal perspective first and date it independently.
- Do preserve report text, evidence gaps and historic links.
- Do verify phone and desktop after token changes.
- Don't invent a first opinion, publication date or market rating.
- Don't hide report columns or remove source explanations.
- Don't add a CMS or public visitor features without a request.
