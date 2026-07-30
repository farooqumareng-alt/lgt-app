import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-200/40 px-4 py-16">
      <Link href="/" className="mb-8 font-display text-3xl tracking-wide text-ink">
        LGT
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
