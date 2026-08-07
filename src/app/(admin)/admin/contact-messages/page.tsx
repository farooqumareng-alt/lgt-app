import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { toggleContactMessageResolved } from "@/server/actions/admin-contact-messages";
import { getAllContactMessagesForAdmin } from "@/server/repositories/admin-contact-messages";

export const metadata: Metadata = {
  title: "Contact Messages",
  robots: { index: false },
};

const FILTERS = ["open", "resolved", "all"] as const;
type Filter = (typeof FILTERS)[number];

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function AdminContactMessagesPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = FILTERS.includes(rawFilter as Filter) ? (rawFilter as Filter) : "open";

  const messages = await getAllContactMessagesForAdmin(filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Contact Messages</h1>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/contact-messages?filter=${f}`}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium capitalize ${
              filter === f ? "bg-saddle text-cream-50" : "bg-cream-200 text-ink/70 hover:bg-cream-300"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {messages.length === 0 && <p className="text-ink/70">No {filter === "all" ? "" : filter} messages.</p>}
        {messages.map((message) => (
          <Card key={message.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{message.name}</p>
                  {message.isResolved && <Badge variant="muted">Resolved</Badge>}
                </div>
                <p className="text-sm text-ink/70">
                  <a href={`mailto:${message.email}`} className="hover:text-saddle">
                    {message.email}
                  </a>
                  {message.orderNumber && <> · Order {message.orderNumber}</>}
                </p>
                <p className="mt-2 text-sm text-ink/80">{message.message}</p>
                <p className="mt-2 text-xs text-ink/50">
                  {new Date(message.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <form action={toggleContactMessageResolved.bind(null, message.id)}>
                <SubmitButton pendingLabel="Saving…" variant="secondary">
                  {message.isResolved ? "Reopen" : "Mark Resolved"}
                </SubmitButton>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
