import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContentPageForm } from "@/components/admin/content-page-form";
import { getContentPageForEdit } from "@/server/repositories/admin-content";
import { deleteContentPage, updateContentPage } from "@/server/actions/admin-content";

export const metadata: Metadata = {
  title: "Edit Content Page",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditContentPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;
  const page = await getContentPageForEdit(id);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{page.title}</h1>
        <form action={deleteContentPage.bind(null, page.id)}>
          <Button type="submit" variant="ghost" className="text-saddle-700">
            Delete Page
          </Button>
        </form>
      </div>
      <Card className="mt-8 p-6">
        <ContentPageForm
          action={updateContentPage.bind(null, page.id)}
          defaultValues={{
            slug: page.slug,
            title: page.title,
            content: page.content,
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            showInFooter: page.showInFooter,
          }}
        />
      </Card>
    </div>
  );
}
