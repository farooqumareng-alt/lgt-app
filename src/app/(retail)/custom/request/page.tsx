import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { CustomRequestForm } from "@/components/retail/custom-request-form";
import { getCustomizableProductOptions } from "@/server/repositories/products";

export const metadata: Metadata = {
  title: "Request a Custom Piece",
  description: "Tell us what you're picturing and we'll follow up with a quote.",
  alternates: { canonical: "/custom/request" },
};

export default async function CustomRequestPage() {
  const products = await getCustomizableProductOptions();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Custom", href: "/custom" },
          { label: "Request", href: "/custom/request" },
        ]}
      />
      <h1 className="mt-4 font-display text-3xl">Request a Custom Piece</h1>
      <p className="mt-2 text-ink/70">
        Bespoke work, bulk orders, or a design that isn&apos;t in the collection yet — tell us
        what you have in mind and we&apos;ll follow up with a quote.
      </p>

      <div className="mt-8">
        <CustomRequestForm products={products} />
      </div>
    </div>
  );
}
