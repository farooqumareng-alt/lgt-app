"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

// SiteHeader's main nav and auth controls are `hidden sm:flex` — below that
// breakpoint there was previously no way to reach Shop/Custom/Wholesale/Blog,
// or to sign in/out, at all. This is the mobile fallback: a hamburger toggle
// + slide-down panel carrying the same links and auth actions.
export function MobileNav({
  isAdmin,
  isLoggedIn,
  logoutAction,
}: {
  isAdmin: boolean;
  isLoggedIn: boolean;
  logoutAction: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="p-2 text-ink/80 hover:text-saddle"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {isOpen && (
        <nav className="absolute inset-x-0 top-full z-30 border-b border-cream-200 bg-cream-50 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link href="/shop" className="py-1 hover:text-saddle" onClick={() => setIsOpen(false)}>
              Shop
            </Link>
            <Link href="/custom" className="py-1 hover:text-saddle" onClick={() => setIsOpen(false)}>
              Custom
            </Link>
            <Link href="/wholesale" className="py-1 hover:text-saddle" onClick={() => setIsOpen(false)}>
              Wholesale
            </Link>
            <Link href="/blog" className="py-1 hover:text-saddle" onClick={() => setIsOpen(false)}>
              Blog
            </Link>
            {isAdmin && (
              <Link href="/admin" className="py-1 hover:text-saddle" onClick={() => setIsOpen(false)}>
                Admin
              </Link>
            )}

            <div className="mt-2 border-t border-cream-200 pt-3">
              {isLoggedIn ? (
                <form action={logoutAction}>
                  <Button type="submit" variant="secondary" className="w-full">
                    Sign out
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="py-1 hover:text-saddle" onClick={() => setIsOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-sm bg-saddle px-4 py-2 text-center text-cream-50 hover:bg-saddle-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
