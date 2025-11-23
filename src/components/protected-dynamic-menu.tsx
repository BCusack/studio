"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchResult {
  selectedFiles: string[];
  cached?: boolean;
  remaining?: number;
}

interface SearchError {
  error: string;
  type:
  | "validation"
  | "rate_limit"
  | "duplicate"
  | "security"
  | "ai_error"
  | "server_error";
  resetTime?: number;
  isBlocked?: boolean;
}

export function ProtectedDynamicMenu({ allFiles }: { allFiles: string[] }) {
  const [query, setQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Client-side rate limiting (1 request per 3 seconds)
  const CLIENT_COOLDOWN = 3000;

  // Update cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!query.trim() || isLoading) return;

      // Client-side cooldown check
      const now = Date.now();
      const timeSinceLastSearch = now - lastSearchTime;
      if (timeSinceLastSearch < CLIENT_COOLDOWN) {
        const remainingCooldown = CLIENT_COOLDOWN - timeSinceLastSearch;
        setCooldownTime(remainingCooldown);
        setError({
          error: `Please wait ${Math.ceil(
            remainingCooldown / 1000
          )} seconds before searching again.`,
          type: "rate_limit",
        });
        return;
      }

      setIsLoading(true);
      setError(null);
      setSelectedFiles(null);
      setCooldownTime(0);

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        let recaptchaToken: string | undefined;

        // Execute reCAPTCHA if available
        if (executeRecaptcha) {
          try {
            recaptchaToken = await executeRecaptcha("ai_search");
          } catch (recaptchaError) {
            console.warn("reCAPTCHA execution failed:", recaptchaError);
            // Continue without reCAPTCHA token
          }
        }

        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query.trim(),
            fileNames: allFiles.map((f) => f.split("/").pop() || ""),
            recaptchaToken,
          }),
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorData = data as SearchError;
          setError(errorData);

          // Handle rate limit with automatic retry countdown
          if (errorData.type === "rate_limit" && errorData.resetTime) {
            const resetDelay = errorData.resetTime - Date.now();
            if (resetDelay > 0 && resetDelay < 60 * 60 * 1000) {
              // Max 1 hour
              setCooldownTime(resetDelay);
            }
          }
          return;
        }

        const result = data as SearchResult;

        // Map selected files back to full paths
        const fullPaths = result.selectedFiles
          .map((selectedName) => {
            return allFiles.find(
              (fullPath) => (fullPath.split("/").pop() || "") === selectedName
            );
          })
          .filter((path): path is string => !!path);

        setSelectedFiles(fullPaths);
        setRemaining(result.remaining ?? null);
        setLastSearchTime(now);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was cancelled, don't show error
        }

        console.error("Search failed:", err);
        setError({
          error: "Search failed. Please check your connection and try again.",
          type: "server_error",
        });
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [query, allFiles, executeRecaptcha, isLoading, lastSearchTime]
  );

  const getFileName = (path: string) =>
    path.split("/").pop()?.replace(".md", "") || "";

  const isDisabled = isLoading || cooldownTime > 0;

  const getErrorIcon = (type: SearchError["type"]) => {
    switch (type) {
      case "rate_limit":
        return <Clock className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorVariant = (type: SearchError["type"]) => {
    switch (type) {
      case "rate_limit":
      case "duplicate":
        return "default";
      case "security":
        return "destructive";
      default:
        return "destructive";
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Input
            placeholder="Search docs with AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isDisabled}
            className="pr-10"
            maxLength={200}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full"
            disabled={isDisabled}
            aria-label="Search"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : cooldownTime > 0 ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Search />
            )}
          </Button>
        </div>

        {/* Rate limit info */}
        {remaining !== null && remaining < 5 && (
          <p className="text-xs text-muted-foreground">
            {remaining} searches remaining in current window
          </p>
        )}

        {/* Cooldown indicator */}
        {cooldownTime > 0 && (
          <p className="text-xs text-muted-foreground">
            Please wait {Math.ceil(cooldownTime / 1000)} seconds before
            searching again
          </p>
        )}
      </form>

      {error && (
        <Alert variant={getErrorVariant(error.type)} className="mt-4">
          {getErrorIcon(error.type)}
          <AlertDescription>{error.error}</AlertDescription>
        </Alert>
      )}

      {selectedFiles && (
        <Card className="mt-4">
          <CardContent className="p-4 space-y-2">
            {selectedFiles.length > 0 ? (
              <ul className="space-y-1">
                {selectedFiles.map((file) => (
                  <li key={file}>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link
                        href={`/${file.replace(/\.md$/, '')}`}
                        className="flex items-center gap-2"
                      >
                        <FileText className="size-4" />
                        <span>{getFileName(file)}</span>
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No relevant files found.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
