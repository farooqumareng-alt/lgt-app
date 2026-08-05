"use client";

import { useActionState } from "react";

import { applyForWholesale } from "@/server/actions/wholesale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WholesaleApplicationForm() {
  const [state, formAction, pending] = useActionState(applyForWholesale, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="businessName">
          Business name
        </label>
        <Input id="businessName" name="businessName" required />
        {errors?.businessName && <p className="text-sm text-saddle-700">{errors.businessName[0]}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="taxId">
          Tax ID / resale certificate (optional)
        </label>
        <Input id="taxId" name="taxId" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="phone">
          Business phone
        </label>
        <Input id="phone" name="phone" required />
        {errors?.phone && <p className="text-sm text-saddle-700">{errors.phone[0]}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="applicationNote">
          Tell us about your business (optional)
        </label>
        <textarea
          id="applicationNote"
          name="applicationNote"
          rows={4}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink placeholder:text-ink/70 focus-visible:border-saddle"
          placeholder="Business type, expected order volume, etc."
        />
      </div>

      {state && !state.success && state.message && (
        <p className="text-sm text-saddle-700">{state.message}</p>
      )}

      <Button type="submit" loading={pending}>
        {pending ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}
