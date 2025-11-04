declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: any[]) => void;
    }
}

function ensureGtagGlobal() {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.gtag = window.gtag || (function gtag(this: any) {
        // push arguments to dataLayer
        (window.dataLayer as unknown[]).push(arguments);
    } as unknown as (...args: any[]) => void);
}

export function updateGtagConsent(granted: boolean) {
    if (typeof window === "undefined") return;
    ensureGtagGlobal();
    const v = granted ? "granted" : "denied";
    window.gtag("consent", "update", {
        analytics_storage: v,
        ad_storage: v,
        ad_user_data: v,
        ad_personalization: v,
    });
}

export function loadGAScript(measurementId: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    ensureGtagGlobal();

    // Avoid duplicate injection
    const existing = document.querySelector(
        `script[src^="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`
    );
    if (existing) {
        // Already loaded; still ensure config executed
        window.gtag("js", new Date());
        window.gtag("config", measurementId, { anonymize_ip: true });
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        s.onload = () => {
            window.gtag("js", new Date());
            window.gtag("config", measurementId, { anonymize_ip: true });
            resolve();
        };
        // insert early in head
        document.head.appendChild(s);
    });
}

export function setDefaultDeniedConsentEarly() {
    // For completeness in client-only flows; in SSR we also inline this in <head>
    if (typeof window === "undefined") return;
    ensureGtagGlobal();
    window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
    });
}
