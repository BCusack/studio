"use client";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-16">
        <div className="flex items-center gap-4">
          <div className="size-16 bg-primary/20 rounded-full animate-pulse" />
          <div className="h-12 w-64 bg-primary/20 rounded animate-pulse" />
        </div>
        <div className="max-w-3xl">
          <div className="h-4 bg-muted/20 rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4" />
        </div>
        <div className="mt-6">
          <div className="h-12 w-48 bg-primary/20 rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-16 py-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 bg-primary/20 rounded animate-pulse" />
              <div className="h-8 w-48 bg-primary/20 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded animate-pulse" />
              <div className="h-4 bg-muted/20 rounded animate-pulse w-4/5" />
              <div className="h-4 bg-muted/20 rounded animate-pulse w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
