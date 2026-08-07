"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

// Below the lg breakpoint the sidebar was previously always rendered at a
// fixed 240px, which on a phone-width viewport left barely any room for the
// actual page content and forced horizontal scrolling. Now it's an
// off-canvas drawer on small screens (hidden by default, toggled by the
// header button, closes on backdrop click or on navigating) and the
// original always-visible column again at lg and up.
export function AdminSidebar({
  userEmail,
  logoutAction,
}: {
  userEmail?: string | null;
  logoutAction: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Leather Goods Texas" width={769} height={756} className="h-8 w-auto" />
          <span className="font-display text-base text-ink/90">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open admin menu"
          className="rounded-sm border border-cream-300 p-2 text-ink/70 hover:border-saddle hover:text-saddle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-cream-200 bg-cream-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <Link href="/admin" className="flex items-center gap-2 px-6 py-5" onClick={() => setIsOpen(false)}>
          <Image src="/logo.png" alt="Leather Goods Texas" width={769} height={756} className="h-9 w-auto" />
          <span className="font-display text-lg text-ink/90">Admin</span>
        </Link>

        <div className="flex-1 overflow-y-auto px-3" onClick={() => setIsOpen(false)}>
          <AdminNav />
        </div>

        <div className="space-y-3 border-t border-cream-200 px-6 py-5">
          <Link href="/" className="block text-sm font-medium text-ink/70 hover:text-saddle">
            View Store
          </Link>
          {userEmail && <p className="truncate text-xs text-ink/50">{userEmail}</p>}
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
