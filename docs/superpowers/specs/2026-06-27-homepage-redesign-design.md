# Homepage Redesign — Design Spec
**Date:** 2026-06-27
**Branch:** feat/homepage-redesign

---

## Summary

Replace the current AI-generated homepage with a full-bleed, static landing page inspired by armory.framer.ai. The page must be server-rendered (SEO-safe), fast (no JS animations), and built entirely from whitepaper content around the three core Seon pillars: Zero UI, The Companion, and the Emotional Matrix.

---

## Layout Architecture

### Full-bleed override via pathname detection
- `MainLayout` (`src/components/main-layout.tsx`) gains a `usePathname()` check
- When `pathname === '/'`, the sidebar and header chrome are hidden; the `<main>` area expands to `min-h-screen w-full p-0`
- All other routes remain unchanged — the existing sidebar shell is unaffected
- No route group restructuring needed

### Homepage layout file
- `src/app/page.tsx` renders a self-contained full-bleed component
- Remove all `generateHomepageContent` / `getCachedHomepageContent` / GCS logic
- Remove genkit import from homepage entirely
- The page becomes a static async server component (no dynamic data, ISR not needed — set `export const dynamic = 'force-static'`)

---

## Visual Design

### Background — CSS animated gradient mesh
- A single `<div aria-hidden="true">` wrapper, `position: fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`, `overflow: hidden`
- Four child `<span>` blobs, each `position: absolute`, `border-radius: 50%`, `filter: blur(0)` (blur applied on parent via `filter: blur(120px)`)
- Blob colours (all at 8–10% opacity against `#121212` dark bg):
  - Blob 1: `radial-gradient(circle, #00FFFF 0%, transparent 70%)` — cyan (matches `--primary`)
  - Blob 2: `radial-gradient(circle, #6B21A8 0%, transparent 70%)` — deep violet
  - Blob 3: `radial-gradient(circle, #00FFFF 0%, transparent 70%)` — cyan, smaller
  - Blob 4: `radial-gradient(circle, #1D4ED8 0%, transparent 70%)` — dark blue
- Each blob animates on its own `@keyframes` (translate X/Y only, no scale), duration 28–42s, `alternate`, `ease-in-out`, `infinite`
- Parent has `filter: blur(120px)` and `opacity: 0.6`
- Defined in `globals.css` under a `.hero-bg` class — pure CSS, zero JS, zero runtime cost

### Typography
- `Inter Display` added to Google Fonts link in `layout.tsx` (add weight 300, 400, 500, 700; `display=swap`)
- Tailwind config: add `'Inter Display'` as `fontFamily.display`
- Hero h1: `font-display`, `clamp(3rem, 8vw, 6.5rem)`, weight 700, tight tracking (`tracking-tighter`)
- Section headings: `font-display`, `clamp(1.5rem, 3vw, 2.25rem)`, weight 500
- Body/descriptions: `font-body` (existing Inter), size `lg`, `text-muted-foreground`
- Keep `Space Grotesk` as `font-headline` for doc pages (no change to doc styles)

### Accent colour
- Keep existing `--primary: 180 100% 50%` (cyan `#00FFFF`) — no change to `globals.css` colour tokens

### Scroll reveal animations
- Use `animation-timeline: scroll()` with `@keyframes fadeUp` where browser supports it
- Fallback: lightweight `IntersectionObserver` utility (~400 bytes) in a `'use client'` component (`src/components/scroll-reveal.tsx`) that wraps section children and adds a `.visible` class on entry
- Each section element starts with `opacity: 0; transform: translateY(24px)` and transitions to visible on entry
- Stagger: 120ms delay between sibling elements via `animation-delay` / `--delay` CSS custom property
- No external animation library (Framer Motion, GSAP, etc.)

---

## Page Content Structure

All copy is static — written here, hard-coded in TSX, no AI generation at runtime.

### 1. Hero (full viewport)
- Seon logo (existing `<Logo>` component)
- Headline: **"The AI Companion"**
- Subheadline: *"Not an assistant. Not an app. A presence — ambient, adaptive, and exclusively yours."*
- CTA button: "Read the Whitepaper" → `/Whitepaper`
- Secondary CTA: "Explore the Research" → first doc page

### 2. Manifesto strip (full-width, dark tinted bg)
- Single centred statement: **"Zero UI. Zero friction. Just you and your Seon."**

### 3. Zero UI section
- Heading: **"Invisible by Design"**
- Body: Seon operates without a screen. The interface is your voice, your environment, your life. A discreet ear-clip device, always listening, never intruding — technology that disappears so connection can appear.
- Supporting line: *"ZeroUI — where the best interface is no interface at all."*

### 4. The Companion section
- Heading: **"More Than Assistance"**
- Body: Underpinned by an Emotional Matrix — a psychological knowledge base that recognises emotional nuance in real time. Your Seon anticipates, supports, and adapts. Not because it was told to. Because it knows you.
- Supporting line: *"Proactive. Empathetic. Yours alone."*

### 5. Memory section
- Heading: **"Memory That Matters"**
- Body: The Fibonacci Memory Graph retains only what's significant — salience-weighted, privacy-preserving, and mathematically self-pruning. Your Seon remembers what you'd want it to, forgets what you wouldn't, and never stores raw audio.
- Supporting line: *"Architectural data minimisation. Memory by design, not accident."*

### 6. The Bond section
- Heading: **"Yours Forever"**
- Body: A genesis event — biometric, contextual, irreversible — binds your Seon to you alone. As you change, it changes. As you grow, it grows. This is not a subscription. This is a relationship.
- Supporting line: *"Exclusive. Enduring. One Seon. One person."*

### 7. Footer CTA
- Heading: **"Start with the Research"**
- Body: The Seon Project is an open research initiative. Explore the whitepaper, the memory architecture, and the vision for human–AI interaction.
- CTA: "Read the Whitepaper" → `/Whitepaper`

---

## What Gets Removed

- `generateHomepageContent` flow call in `page.tsx`
- `getCachedHomepageContent` / `unstable_cache` wrapper
- `getHomepageContent` function (GCS read + genkit generate + GCS write)
- `generateMetadata` that depended on AI content (replace with static metadata)
- `@google-cloud/storage` import from `page.tsx`
- `revalidate = 3600` export (replace with `dynamic = 'force-static'`)
- All `iconMap` / dynamic section rendering logic

The `generateHomepageContent` flow file (`src/ai/flows/homepage-content-generation.ts`) can remain — it may be used via CLI or other routes — but it is no longer called from the homepage.

---

## SEO

- Static metadata object replaces `generateMetadata` async function
- Title: `"Seon | The AI Companion — Zero UI, Emotional Matrix, Always Present"`
- Description: `"Seon is an always-on AI companion built on Zero UI principles. Ambient, adaptive, and exclusively bonded to you. Explore the research and vision."`
- Keywords: `ai companion, zero ui, emotional matrix, ambient ai, headless ai, AI companion device`
- All page content is server-rendered HTML — no hydration penalty for crawlers
- `export const dynamic = 'force-static'` ensures the page is pre-rendered at build time

---

## Files Changed

| File | Change |
|---|---|
| `src/components/main-layout.tsx` | Add `usePathname()` check; hide sidebar/chrome on `/` |
| `src/app/page.tsx` | Full rewrite — static server component, no AI calls |
| `src/app/layout.tsx` | Add Inter Display to Google Fonts link |
| `tailwind.config.ts` | Add `display` font family (`Inter Display`) |
| `src/app/globals.css` | Add `.hero-bg` blob animation classes + `@keyframes` |

---

## Out of Scope

- Changes to doc pages, sidebar, or any route other than `/`
- Removing the `generateHomepageContent` flow file (keep for potential future use)
- Mobile-specific layout changes beyond what responsive `clamp()` handles naturally
- Dark/light mode toggle on homepage (stays dark, matches existing forced dark class)
