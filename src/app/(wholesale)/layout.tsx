import { SiteHeader } from "@/components/retail/site-header";

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader channel="WHOLESALE" />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-cream-200 px-6 py-10 text-center text-sm text-ink/70">
        <p>© {new Date().getFullYear()} Leather Goods Texas — Wholesale</p>
        <p className="mt-1 text-xs">
          Developed and designed by{" "}
          <a
            href="https://www.fixvise.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-saddle hover:underline"
          >
            www.fixvise.com
          </a>
        </p>
      </footer>
    </div>
  );
}
