import Image from "next/image";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 bg-cream-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 py-1">
              <Image src="/logo.png" alt="Leather Goods Texas" width={769} height={756} className="h-9 w-auto" />
              <span className="font-display text-lg text-ink/90">Admin</span>
            </Link>
            <AdminNav />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-ink/60 hover:text-saddle">
              View Store
            </Link>
            {session?.user?.email && (
              <span className="hidden text-sm text-ink/50 md:inline">{session.user.email}</span>
            )}
            <form action={logout}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
