import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Github, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

const description =
  "Seon is a research and development project exploring AI companions and a more natural, ambient future for human-computer interaction.";

export const metadata: Metadata = {
  title: { absolute: "Seon | A more human future for AI" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Seon | A more human future for AI",
    description,
    url: "/",
    type: "website",
    siteName: "Seon",
  },
  twitter: {
    card: "summary",
    title: "Seon | A more human future for AI",
    description,
  },
};

const ideas = [
  {
    number: "01",
    title: "Companionship, not just commands",
    description:
      "Exploring AI companions that make interaction feel more personal, conversational, and grounded in human needs.",
  },
  {
    number: "02",
    title: "Beyond the screen",
    description:
      "Imagining ambient experiences that move beyond apps and interfaces, bringing technology into the flow of everyday life.",
  },
  {
    number: "03",
    title: "Built on open inquiry",
    description:
      "Sharing the research, questions, and development behind Seon as the project takes shape.",
  },
];

const paths = [
  {
    label: "The vision",
    title: "Read the whitepaper",
    description: "Explore the thinking and ambition behind the project.",
    href: "/Whitepaper",
    icon: BookOpen,
  },
  {
    label: "The process",
    title: "Explore discovery",
    description: "See the questions and investigation shaping Seon.",
    href: "/Project/Discovery",
    icon: Sparkles,
  },
  {
    label: "The research",
    title: "Explore Zero UI",
    description: "Discover the ideas behind more natural AI interactions.",
    href: "/Research/Zero UI AI Companions",
    icon: ArrowRight,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="landing-hero-glow pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28 lg:py-36">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-36 top-4 h-80 w-80 rounded-full border border-primary/20 bg-primary/5 sm:right-4 sm:h-[28rem] sm:w-[28rem]"
          >
            <div className="absolute inset-10 rounded-full border border-primary/20 sm:inset-16" />
            <div className="absolute inset-20 rounded-full border border-primary/30 sm:inset-32" />
            <Logo className="absolute inset-0 m-auto size-16 text-primary/40 sm:size-24" ariaHidden={true} />
          </div>
          <div className="relative max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <span className="size-2 rounded-full bg-primary" />
              An open research &amp; development project
            </p>
            <h1 className="font-headline text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              A more human future for <span className="text-primary">AI.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Seon explores AI companions and a world where technology feels less
              like an interface, and more like a natural part of life.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/Whitepaper">
                  Read the whitepaper <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#ideas">
                  Explore the ideas <ArrowDown aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="ideas" className="scroll-mt-20 py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              The idea behind Seon
            </p>
            <h2 className="mt-4 max-w-md font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Less interface. More connection.
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            What if computing adapted to people, instead of asking people to
            adapt to it? Seon is an ongoing exploration of that question,
            bringing together AI companions, ambient technology, and Zero UI.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {ideas.map((idea) => (
            <article key={idea.number} className="bg-card p-7 sm:p-8">
              <span className="font-headline text-sm text-primary">
                {idea.number} / 03
              </span>
              <h3 className="mt-8 font-headline text-xl font-bold">
                {idea.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {idea.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Go deeper
            </p>
            <h2 className="mt-4 font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Follow the thinking.
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Start with the vision, or explore how the project is taking shape.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {paths.map(({ label, title, description: pathDescription, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-56 flex-col rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-center justify-between text-primary">
                <Icon className="size-5" aria-hidden="true" />
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
              </div>
              <p className="mt-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {label}
              </p>
              <h3 className="mt-2 font-headline text-xl font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {pathDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-16 rounded-xl border border-primary/20 bg-primary/5 p-8 sm:p-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              An evolving project
            </p>
            <h2 className="mt-4 font-headline text-3xl font-bold tracking-tight">
              The future is a conversation.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Seon is a work in progress. Explore the source, follow the
              research, and help support the journey.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href="https://github.com/BCusack/Seon" target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" /> View on GitHub
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://ko-fi.com/W7W31G9CXW" target="_blank" rel="noopener noreferrer">
                <Heart aria-hidden="true" /> Support Seon
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
