# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the AI-generated homepage with a full-bleed, static landing page featuring a CSS animated gradient mesh background, Inter Display typography, and scroll-reveal sections built from Seon whitepaper content.

**Architecture:** The homepage breaks out of the existing `MainLayout` shell by hiding the header and breadcrumbs when `pathname === '/'`. The page itself is a static server component — `force-static`, no AI calls, no GCS — that renders seven content sections with a fixed blob mesh behind them. Scroll reveals are handled by a tiny `IntersectionObserver` client component.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v3, TypeScript, Google Fonts (Inter Display), CSS `@keyframes`, `IntersectionObserver` API.

## Global Constraints

- Branch: `feat/homepage-redesign`
- Keep all existing accent colours unchanged — `--primary: 180 100% 50%` (cyan `#00FFFF`) is not touched
- `Space Grotesk` / `font-headline` must remain working for doc pages
- Zero external animation libraries (no Framer Motion, no GSAP)
- Homepage must be `force-static` — no `fetch`, no genkit, no GCS imports
- All content copy must match the spec verbatim (`docs/superpowers/specs/2026-06-27-homepage-redesign-design.md`)
- TypeScript must pass (`npx tsc --noEmit`) after every task
- `npm run build` must pass after the final task

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/layout.tsx` | Modify | Add Inter Display to Google Fonts link |
| `tailwind.config.ts` | Modify | Add `display` font family |
| `src/app/globals.css` | Modify | Add `.hero-bg` blob classes + `@keyframes` + `.reveal` scroll classes |
| `src/components/scroll-reveal.tsx` | Create | Tiny `IntersectionObserver` client component |
| `src/components/main-layout.tsx` | Modify | Hide header + breadcrumbs on `/` via `usePathname()` |
| `src/app/page.tsx` | Rewrite | Static server component with 7 content sections |

---

## Task 1: Add Inter Display font + Tailwind `display` family

**Files:**
- Modify: `src/app/layout.tsx` (lines 106–111)
- Modify: `tailwind.config.ts` (lines 12–16)

**Interfaces:**
- Produces: Tailwind class `font-display` available globally

- [ ] **Step 1: Add Inter Display to Google Fonts link in `layout.tsx`**

Replace the existing Inter font link (around line 106) with a combined link that includes Inter Display:

```tsx
// Before:
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
  rel="stylesheet"
/>

// After — replace with this single link covering both Inter and Inter Display:
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Inter+Display:wght@300;400;500;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Add `display` font family to `tailwind.config.ts`**

In the `fontFamily` block (currently has `body`, `headline`, `code`), add `display`:

```ts
fontFamily: {
  body: ['Inter', 'sans-serif'],
  headline: ['Space Grotesk', 'sans-serif'],
  display: ['Inter Display', 'Inter', 'sans-serif'],
  code: ['monospace'],
},
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx tailwind.config.ts
git commit -m "feat: add Inter Display font and display Tailwind family"
```

---

## Task 2: Add blob mesh + scroll-reveal CSS to `globals.css`

**Files:**
- Modify: `src/app/globals.css` (append after existing content)

**Interfaces:**
- Produces: CSS classes `.hero-bg`, `.reveal`, `.reveal.visible` usable in TSX

- [ ] **Step 1: Append blob mesh CSS to the end of `globals.css`**

Add this entire block at the bottom of `src/app/globals.css`:

```css
/* ============================================================
   Hero blob mesh background
   ============================================================ */
.hero-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  filter: blur(120px);
  opacity: 0.55;
}

.hero-bg span {
  position: absolute;
  border-radius: 50%;
}

.hero-bg span:nth-child(1) {
  width: 55vw;
  height: 55vw;
  top: -15%;
  left: -15%;
  background: radial-gradient(circle, #00ffff 0%, transparent 70%);
  opacity: 0.12;
  animation: hero-blob-1 32s ease-in-out infinite alternate;
}

.hero-bg span:nth-child(2) {
  width: 45vw;
  height: 45vw;
  top: 25%;
  right: -15%;
  background: radial-gradient(circle, #6b21a8 0%, transparent 70%);
  opacity: 0.10;
  animation: hero-blob-2 28s ease-in-out infinite alternate;
}

.hero-bg span:nth-child(3) {
  width: 40vw;
  height: 40vw;
  bottom: -15%;
  left: 25%;
  background: radial-gradient(circle, #00ffff 0%, transparent 70%);
  opacity: 0.08;
  animation: hero-blob-3 38s ease-in-out infinite alternate;
}

.hero-bg span:nth-child(4) {
  width: 35vw;
  height: 35vw;
  top: 55%;
  left: -10%;
  background: radial-gradient(circle, #1d4ed8 0%, transparent 70%);
  opacity: 0.10;
  animation: hero-blob-4 42s ease-in-out infinite alternate;
}

@keyframes hero-blob-1 {
  from { transform: translate(0, 0); }
  to   { transform: translate(15vw, 20vh); }
}

@keyframes hero-blob-2 {
  from { transform: translate(0, 0); }
  to   { transform: translate(-12vw, -15vh); }
}

@keyframes hero-blob-3 {
  from { transform: translate(0, 0); }
  to   { transform: translate(-10vw, -20vh); }
}

@keyframes hero-blob-4 {
  from { transform: translate(0, 0); }
  to   { transform: translate(18vw, -10vh); }
}

/* ============================================================
   Scroll reveal
   ============================================================ */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: Verify TypeScript (CSS changes don't affect TS, but confirm no import errors)**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add hero blob mesh and scroll-reveal CSS"
```

---

## Task 3: Create `ScrollReveal` client component

**Files:**
- Create: `src/components/scroll-reveal.tsx`

**Interfaces:**
- Produces:
  ```ts
  export default function ScrollReveal(props: {
    children: ReactNode;
    delay?: number;     // ms, default 0
    className?: string; // forwarded to wrapper div
  }): JSX.Element
  ```
- Consumed by: `src/app/page.tsx` (Task 5)

- [ ] **Step 1: Create `src/components/scroll-reveal.tsx`**

```tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/scroll-reveal.tsx
git commit -m "feat: add ScrollReveal IntersectionObserver component"
```

---

## Task 4: Hide header + breadcrumbs in `MainLayout` on homepage

**Files:**
- Modify: `src/components/main-layout.tsx`

**Interfaces:**
- Consumes: `usePathname` from `next/navigation`
- Produces: `MainLayout` renders `<>{children}</>` when `pathname === '/'`; full shell otherwise (no interface change for callers)

- [ ] **Step 1: Add `usePathname` import and conditional render to `main-layout.tsx`**

Add `usePathname` to the imports at line 1:

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";  // ← add this line
import Link from "next/link";
// ... rest of imports unchanged
```

Then, inside the `MainLayout` function body, directly after the `const fileTree = buildFileTree(files);` line and before the paper mode state, add the pathname check and early return:

```tsx
export default function MainLayout({
  files,
  children,
}: {
  files: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const fileTree = buildFileTree(files);

  // Homepage: full-bleed layout — no header, no breadcrumbs, no padding
  if (pathname === '/') {
    return <>{children}</>;
  }

  // Paper read mode: persisted in localStorage and toggles a root class.
  // ... rest of component unchanged
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/main-layout.tsx
git commit -m "feat: hide MainLayout shell on homepage for full-bleed layout"
```

---

## Task 5: Rewrite `page.tsx` as static server component

**Files:**
- Rewrite: `src/app/page.tsx`

**Interfaces:**
- Consumes:
  - `ScrollReveal` from `@/components/scroll-reveal` (Task 3)
  - `.hero-bg`, `.reveal`, `.reveal.visible` CSS classes (Task 2)
  - `font-display` Tailwind class (Task 1)
- Produces: static server-rendered homepage at `/`

- [ ] **Step 1: Replace the entire contents of `src/app/page.tsx` with the following**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import ScrollReveal from '@/components/scroll-reveal';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Seon | The AI Companion — Zero UI, Emotional Matrix, Always Present',
  description:
    'Seon is an always-on AI companion built on Zero UI principles. Ambient, adaptive, and exclusively bonded to you. Explore the research and vision.',
  keywords: [
    'ai companion',
    'zero ui',
    'emotional matrix',
    'ambient ai',
    'headless ai',
    'AI companion device',
  ],
  openGraph: {
    title: 'Seon | The AI Companion — Zero UI, Emotional Matrix, Always Present',
    description:
      'Seon is an always-on AI companion built on Zero UI principles. Ambient, adaptive, and exclusively bonded to you.',
    url: '/',
    type: 'website',
    siteName: 'Seon',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'Seon – The AI Companion' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seon | The AI Companion',
    description: 'An always-on AI companion built on Zero UI principles.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated blob mesh background */}
      <div className="hero-bg" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* ── Hero — full viewport ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-svh text-center px-6">
        <ScrollReveal>
          <Logo className="size-16 text-primary mb-8" ariaHidden={true} />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h1
            className="font-display font-bold tracking-tighter text-foreground"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', lineHeight: 1.05 }}
          >
            The AI Companion
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <p
            className="mt-6 max-w-2xl text-muted-foreground"
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)' }}
          >
            Not an assistant. Not an app. A presence — ambient, adaptive, and
            exclusively yours.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/Whitepaper" aria-label="Read the Seon white paper">
              <Button variant="inverted" size="lg">
                <Github className="mr-2 size-4" aria-hidden="true" />
                Read the Whitepaper
              </Button>
            </Link>
            <a
              href="https://github.com/BCusack/Seon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Seon on GitHub (opens in new tab)"
            >
              <Button variant="outline" size="lg">
                View on GitHub
              </Button>
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Manifesto strip ── */}
      <section className="relative z-10 py-20 border-y border-border/30 bg-background/40 backdrop-blur-sm">
        <ScrollReveal>
          <p
            className="text-center font-display font-medium tracking-tight text-foreground/80 px-6"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            Zero UI. Zero friction.
            <br />
            Just you and your Seon.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Content sections ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 space-y-32">

        {/* Zero UI */}
        <section aria-labelledby="section-zeroui">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-widest text-primary mb-4 font-medium">
              Zero UI
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h2
              id="section-zeroui"
              className="font-display font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              Invisible by Design
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Seon operates without a screen. The interface is your voice, your
              environment, your life. A discreet ear-clip device, always listening,
              never intruding — technology that disappears so connection can appear.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <p className="mt-6 text-sm text-primary/80 italic">
              ZeroUI — where the best interface is no interface at all.
            </p>
          </ScrollReveal>
        </section>

        {/* The Companion */}
        <section aria-labelledby="section-companion">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-widest text-primary mb-4 font-medium">
              The Companion
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h2
              id="section-companion"
              className="font-display font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              More Than Assistance
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Underpinned by an Emotional Matrix — a psychological knowledge base
              that recognises emotional nuance in real time. Your Seon anticipates,
              supports, and adapts. Not because it was told to. Because it knows you.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <p className="mt-6 text-sm text-primary/80 italic">
              Proactive. Empathetic. Yours alone.
            </p>
          </ScrollReveal>
        </section>

        {/* Memory */}
        <section aria-labelledby="section-memory">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-widest text-primary mb-4 font-medium">
              Memory
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h2
              id="section-memory"
              className="font-display font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              Memory That Matters
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              The Fibonacci Memory Graph retains only what&apos;s significant —
              salience-weighted, privacy-preserving, and mathematically
              self-pruning. Your Seon remembers what you&apos;d want it to, forgets
              what you wouldn&apos;t, and never stores raw audio.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <p className="mt-6 text-sm text-primary/80 italic">
              Architectural data minimisation. Memory by design, not accident.
            </p>
          </ScrollReveal>
        </section>

        {/* The Bond */}
        <section aria-labelledby="section-bond">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-widest text-primary mb-4 font-medium">
              The Bond
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h2
              id="section-bond"
              className="font-display font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              Yours Forever
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              A genesis event — biometric, contextual, irreversible — binds your
              Seon to you alone. As you change, it changes. As you grow, it grows.
              This is not a subscription. This is a relationship.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <p className="mt-6 text-sm text-primary/80 italic">
              Exclusive. Enduring. One Seon. One person.
            </p>
          </ScrollReveal>
        </section>
      </div>

      {/* ── Footer CTA ── */}
      <section className="relative z-10 border-t border-border/30 bg-background/40 backdrop-blur-sm py-24 text-center px-6">
        <ScrollReveal>
          <h2
            className="font-display font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Start with the Research
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            The Seon Project is an open research initiative. Explore the
            whitepaper, the memory architecture, and the vision for human–AI
            interaction.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <div className="mt-8">
            <Link href="/Whitepaper" aria-label="Read the Seon white paper">
              <Button variant="inverted" size="lg">
                <Github className="mr-2 size-4" aria-hidden="true" />
                Read the Whitepaper
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: replace AI-generated homepage with static full-bleed landing page"
```

---

## Task 6: Final build verification

**Files:** None changed — verification only.

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected output includes:
```
Route (app)                              Size
┌ ○ /                                   ... kB
```
The `/` route should show `○` (static) not `λ` (dynamic).
Expected: build succeeds with no errors.

- [ ] **Step 3: Spot-check the dev server**

```bash
npm run dev
```

Navigate to `http://localhost:9002` — verify:
- Full-bleed dark page with blob mesh visible
- Header and breadcrumbs absent on `/`
- Navigate to any doc page (e.g. `/Whitepaper`) — header and sidebar reappear correctly
- Four content sections visible with scroll-in animation on scroll

- [ ] **Step 4: Commit build confirmation note (no code changes)**

No commit needed if build was clean. If any fixes were required, commit them:

```bash
git add -A
git commit -m "fix: resolve build issues from homepage redesign"
```
