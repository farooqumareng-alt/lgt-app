import Link from "next/link";

import { SiteHeader } from "@/components/retail/site-header";
import { getFooterContentPages } from "@/server/repositories/admin-content";

export default async function RetailLayout({ children }: { children: React.ReactNode }) {
  const footerPages = await getFooterContentPages();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-cream-200 bg-cream-200/40">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="font-display text-lg">Leather Goods Texas</p>
              <p className="mt-2 text-sm text-ink/70">
                Full-grain leather goods, handcrafted to outlast trends — built for individuals and businesses
                alike.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Shop</p>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/shop" className="text-ink/70 hover:text-saddle">
                  All Products
                </Link>
                <Link href="/custom" className="text-ink/70 hover:text-saddle">
                  Custom Embossing
                </Link>
                <Link href="/wholesale" className="text-ink/70 hover:text-saddle">
                  Wholesale Program
                </Link>
              </nav>
            </div>
            {footerPages.length > 0 && (
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Company</p>
                <nav className="mt-3 flex flex-col gap-2 text-sm">
                  {footerPages.map((page) => (
                    <Link key={page.slug} href={`/${page.slug}`} className="text-ink/70 hover:text-saddle">
                      {page.title}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
          <div className="mt-10 border-t border-cream-200 pt-6 text-center text-sm text-ink/60">
            <p>© {new Date().getFullYear()} Leather Goods Texas</p>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
