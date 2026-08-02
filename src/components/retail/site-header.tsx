import Image from "next/image";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { getCart } from "@/server/repositories/cart";
import { getWholesaleCartItemCount } from "@/server/repositories/wholesale-cart";

export async function SiteHeader({ channel = "RETAIL" }: { channel?: "RETAIL" | "WHOLESALE" }) {
  const cartHref = channel === "WHOLESALE" ? "/wholesale/cart" : "/cart";
  const [session, itemCount] = await Promise.all([
    auth(),
    channel === "WHOLESALE"
      ? getWholesaleCartItemCount()
      : getCart().then((cart) => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0),
  ]);

  return (
    <header className="border-b border-cream-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center py-1">
          <Image
            src="/logo.png"
            alt="Leather Goods Texas"
            width={769}
            height={756}
            className="h-16 w-auto sm:h-[4.5rem]"
            priority
          />
        </Link>

        <nav className="hidden gap-8 text-sm font-medium sm:flex">
          <Link href="/shop" className="hover:text-saddle">
            Shop
          </Link>
          <Link href="/custom" className="hover:text-saddle">
            Custom
          </Link>
          <Link href="/wholesale" className="hover:text-saddle">
            Wholesale
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href={cartHref} className="relative flex items-center p-2 hover:text-saddle" aria-label="Cart">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
              <path d="M6 6 5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.25" />
              <circle cx="18" cy="20" r="1.25" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-saddle px-1 text-[10px] font-medium text-cream-50">
                {itemCount}
              </span>
            )}
          </Link>
          {session?.user ? (
            <form action={logout}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-saddle">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-sm bg-saddle px-4 py-2 text-sm font-medium text-cream-50 hover:bg-saddle-600"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
