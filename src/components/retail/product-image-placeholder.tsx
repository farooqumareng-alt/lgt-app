import { cn } from "@/lib/utils";

export function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-cream-200 text-saddle",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        className="h-10 w-10 opacity-60"
        aria-hidden="true"
      >
        <path d="M7 8V6a5 5 0 0 1 10 0v2" strokeLinecap="round" />
        <rect x="4" y="8" width="16" height="12" rx="1.5" />
      </svg>
      <span className="text-xs font-medium uppercase tracking-wide text-ink/50">
        Photo coming soon
      </span>
    </div>
  );
}
