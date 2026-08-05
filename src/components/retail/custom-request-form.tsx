"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitCustomRequest } from "@/server/actions/custom-request";

type Product = { id: string; name: string };

export function CustomRequestForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(submitCustomRequest, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  if (state?.success) {
    return (
      <div className="rounded-sm border border-cream-200 bg-cream-50 p-8 text-center">
        <p className="font-display text-2xl">Request received</p>
        <p className="mt-2 text-ink/70">
          Thanks — we&apos;ll review your request and follow up by email, usually within 1–2
          business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Your name
          </label>
          <Input id="name" name="name" required />
          {errors?.name && <p className="text-sm text-saddle-700">{errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" required />
          {errors?.email && <p className="text-sm text-saddle-700">{errors.email[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="phone">
            Phone (optional)
          </label>
          <Input id="phone" name="phone" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="budget">
            Approximate budget (optional)
          </label>
          <Input id="budget" name="budget" placeholder="e.g. $100–200" />
        </div>

        {products.length > 0 && (
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="productId">
              Closest existing product (optional)
            </label>
            <select
              id="productId"
              name="productId"
              defaultValue=""
              className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
            >
              <option value="">Something entirely new</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Describe what you&apos;d like
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            placeholder="Item type, sizing, logo/engraving details, quantity, deadline — anything that helps us quote it accurately."
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink placeholder:text-ink/70 focus-visible:border-saddle"
          />
          {errors?.description && <p className="text-sm text-saddle-700">{errors.description[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="referenceImages">
            Reference images (optional)
          </label>
          <input
            id="referenceImages"
            name="referenceImages"
            type="file"
            accept="image/*"
            multiple
            className="block text-sm"
          />
          <p className="text-xs text-ink/70">Up to 5 images — a logo file, design reference, or photos help us quote accurately.</p>
        </div>
      </div>

      {state && !state.success && state.message && <p className="text-sm text-saddle-700">{state.message}</p>}

      <Button type="submit" loading={pending}>
        {pending ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}
