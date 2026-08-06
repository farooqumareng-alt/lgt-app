import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { ContentPageForm } from "@/components/admin/content-page-form";
import { createContentPage } from "@/server/actions/admin-content";

export const metadata: Metadata = {
  title: "New Content Page",
  robots: { index: false },
};

export default async function NewContentPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">New Content Page</h1>
      <Card className="mt-8 p-6">
        <ContentPageForm action={createContentPage} submitLabel="Create Page" />
      </Card>
    </div>
  );
}
