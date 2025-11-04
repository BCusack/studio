import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Seon",
  description:
    "Learn how Seon handles your data, cookies, and analytics preferences.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>
        We respect your privacy. This page describes how we collect, use, and
        protect your information when you use our website.
      </p>
      <h2>Cookies and Analytics</h2>
      <p>
        We use essential cookies to make the site work. Analytics cookies are
        optional and only enabled if you accept them via the cookie banner. You
        can change your choice at any time.
      </p>
      <h2>Data Collection</h2>
      <p>
        When analytics are enabled, we collect aggregated usage metrics to help
        improve the site experience. We do not sell personal data.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy? Contact us at
        {" "}
        <a href="mailto:contact@theseonproject.com">
          contact@theseonproject.com
        </a>
        .
      </p>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}
