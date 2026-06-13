# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal blog and portfolio site for Siddhartha Palavajjhala (Sid Pal), a quant finance professional/student. Deployed via GitHub Pages at `sidpal.xyz`. Built with Jekyll — GitHub Pages handles the build; there is no local build step or Gemfile in this repo.

## Config

Jekyll config is at `_config.yml`. Site-wide settings (`site.title`, `site.url`, etc.) are defined there.

## Architecture

- **Single layout**: `_layouts/default.html` — every page uses `layout: default`. All global HTML (header, nav, footer, scripts) lives here.
- **Pages**: Top-level `index.md` and subdirectory `index.md` files (`/about`, `/blog`, `/projects`, `/reading-list`). Each uses front matter `layout: default` and `title:`.
- **Blog posts**: Go in `_posts/` following Jekyll's naming convention `YYYY-MM-DD-title.md` with `layout: default` front matter. Currently empty.
- **Styling**: Single CSS file at `assets/css/style.css`. Uses CSS custom properties (`--var-name`) for theming. Light/dark mode is toggled via `data-theme` attribute on `<html>`, persisted in `localStorage`.
- **Math**: MathJax 2.7.7 is loaded globally in the layout. Use standard LaTeX delimiters.
- **Analytics**: Google Analytics tag (`G-C1N9XM7YGH`) is hardcoded in `_layouts/default.html`.

## Adding Content

**New blog post**: Create `_posts/YYYY-MM-DD-slug.md` with front matter:
```yaml
---
layout: default
title: Post Title
---
```

**New page**: Create a directory with an `index.md` (e.g., `talks/index.md`) and add a nav link in `_layouts/default.html`.

## Local Preview

If you want to preview locally (requires Ruby/Jekyll installed):
```bash
gem install jekyll bundler
jekyll serve
```
The site will be at `http://localhost:4000`.

## Design Conventions

- Max content width: 680px (set on both `.header-content` and `main`)
- Fonts: Inter (body), Libre Baskerville (headings/serif accents)
- Nav links use a `data-text` attribute that mirrors their visible text — needed for the bold-on-hover no-layout-shift trick in CSS
- Mobile breakpoint: 600px — nav is hidden on mobile (`display: none`)
