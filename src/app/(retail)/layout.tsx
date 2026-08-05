import { SiteHeader } from "@/components/retail/site-header";

export default function RetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-cream-200 px-6 py-10 text-center text-sm text-ink/70">
        © {new Date().getFullYear()} Leather Goods Texas
      </footer>
    </div>
  );
}
