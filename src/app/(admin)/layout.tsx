import Image from "next/image";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-cream-200">
        <Link href="/admin" className="flex items-center gap-2 px-6 py-5">
          <Image src="/logo.png" alt="Leather Goods Texas" width={769} height={756} className="h-9 w-auto" />
          <span className="font-display text-lg text-ink/90">Admin</span>
        </Link>

        <div className="flex-1 px-3">
          <AdminNav />
        </div>

        <div className="space-y-3 border-t border-cream-200 px-6 py-5">
          <Link href="/" className="block text-sm font-medium text-ink/70 hover:text-saddle">
            View Store
          </Link>
          {session?.user?.email && <p className="truncate text-xs text-ink/50">{session.user.email}</p>}
          <form action={logout}>
            <Button type="submit" variant="secondary" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
