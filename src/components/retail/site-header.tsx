import Link from "next/link";

import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-cream-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl tracking-wide">
          LGT
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
