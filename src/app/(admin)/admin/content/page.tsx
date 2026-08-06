import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllContentPagesForAdmin } from "@/server/repositories/admin-content";

export const metadata: Metadata = {
  title: "Content Pages",
  robots: { index: false },
};

export default async function AdminContentPage() {
  await requireRole("ADMIN");
  const pages = await getAllContentPagesForAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Content Pages</h1>
        <ButtonLink href="/admin/content/new">New Page</ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {pages.length === 0 && <p className="text-ink/70">No content pages yet.</p>}
        {pages.map((page) => (
          <Link key={page.id} href={`/admin/content/${page.id}/edit`}>
            <Card interactive stitched className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{page.title}</p>
                <p className="text-xs text-ink/60">/{page.slug}</p>
              </div>
              {!page.showInFooter && <Badge variant="muted">Hidden from footer</Badge>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
