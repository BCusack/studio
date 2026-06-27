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
