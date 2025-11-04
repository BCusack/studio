export type ConsentDecision = "accepted" | "rejected" | "unset";

const STORAGE_KEY = "cookie-consent";
const EVENT_NAME = "consentchange";

export function getConsent(): ConsentDecision {
    if (typeof window === "undefined") return "unset";
    try {
        const v = window.localStorage.getItem(STORAGE_KEY);
        if (v === "accepted" || v === "rejected") return v;
    } catch (_e) {
        // ignore storage errors (e.g., privacy mode)
    }
    return "unset";
}

export function setConsent(value: Exclude<ConsentDecision, "unset">) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_e) {
        // ignore
    }
    // announce change
    try {
        window.dispatchEvent(new CustomEvent<ConsentDecision>(EVENT_NAME, { detail: value }));
    } catch (_e) {
        // ignore
    }
}

export function onConsentChange(handler: (value: ConsentDecision) => void) {
    if (typeof window === "undefined") return () => { };
    const listener = (e: Event) => {
        const ce = e as CustomEvent<ConsentDecision>;
        handler(ce.detail ?? getConsent());
    };
    window.addEventListener(EVENT_NAME, listener as EventListener);
    return () => window.removeEventListener(EVENT_NAME, listener as EventListener);
}

export const CONSENT_STORAGE_KEY = STORAGE_KEY;
