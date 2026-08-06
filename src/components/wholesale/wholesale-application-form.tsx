"use client";

import { useActionState } from "react";

import { applyForWholesale } from "@/server/actions/wholesale";
import { STORE_TYPES } from "@/lib/validation/wholesale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WholesaleApplicationForm() {
  const [state, formAction, pending] = useActionState(applyForWholesale, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-lg">Business Information</legend>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="businessName">
            Business name
          </label>
          <Input id="businessName" name="businessName" required />
          {errors?.businessName && <p className="text-sm text-saddle-700">{errors.businessName[0]}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="phone">
              Business phone
            </label>
            <Input id="phone" name="phone" required />
            {errors?.phone && <p className="text-sm text-saddle-700">{errors.phone[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="website">
              Website (optional)
            </label>
            <Input id="website" name="website" placeholder="https://" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="storeType">
            Store type
          </label>
          <select
            id="storeType"
            name="storeType"
            required
            defaultValue=""
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          >
            <option value="" disabled>
              Select a store type
            </option>
            {STORE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors?.storeType && <p className="text-sm text-saddle-700">{errors.storeType[0]}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="taxId">
              Resale certificate / tax ID
            </label>
            <Input id="taxId" name="taxId" required />
            {errors?.taxId && <p className="text-sm text-saddle-700">{errors.taxId[0]}</p>}
            <p className="text-xs text-ink/50">
              Required for most US businesses — this is what qualifies your account for tax-exempt
              purchasing.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="ein">
              EIN (optional)
            </label>
            <Input id="ein" name="ein" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-lg">Business Address</legend>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="addressLine1">
            Address
          </label>
          <Input id="addressLine1" name="addressLine1" required />
          {errors?.addressLine1 && <p className="text-sm text-saddle-700">{errors.addressLine1[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="addressLine2">
            Suite / unit (optional)
          </label>
          <Input id="addressLine2" name="addressLine2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="addressCity">
              City
            </label>
            <Input id="addressCity" name="addressCity" required />
            {errors?.addressCity && <p className="text-sm text-saddle-700">{errors.addressCity[0]}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="addressState">
              State
            </label>
            <Input id="addressState" name="addressState" required />
            {errors?.addressState && <p className="text-sm text-saddle-700">{errors.addressState[0]}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="addressPostalCode">
              ZIP code
            </label>
            <Input id="addressPostalCode" name="addressPostalCode" required />
            {errors?.addressPostalCode && (
              <p className="text-sm text-saddle-700">{errors.addressPostalCode[0]}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-1">
        <legend className="font-display text-lg">Tell Us About Your Business</legend>
        <label className="sr-only" htmlFor="applicationNote">
          Business details
        </label>
        <textarea
          id="applicationNote"
          name="applicationNote"
          rows={4}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink placeholder:text-ink/70 focus-visible:border-saddle"
          placeholder="Expected order volume, product interests, anything else that helps us review your application."
        />
      </fieldset>

      {state && !state.success && state.message && (
        <p className="text-sm text-saddle-700">{state.message}</p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Submitting…" : "Submit Wholesale Application"}
      </Button>
    </form>
  );
}
