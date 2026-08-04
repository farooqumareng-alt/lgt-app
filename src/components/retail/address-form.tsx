"use client";

import { useActionState } from "react";

import type { AddressActionResult } from "@/server/actions/addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddressFormValues = {
  label?: string | null;
  fullName?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string | null;
  isDefault?: boolean;
};

type AddressFormAction = (
  prevState: AddressActionResult | undefined,
  formData: FormData,
) => Promise<AddressActionResult>;

export function AddressForm({
  action,
  defaultValues,
  submitLabel = "Save Address",
  onSuccess,
}: {
  action: AddressFormAction;
  defaultValues?: AddressFormValues;
  submitLabel?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(async (prev: AddressActionResult | undefined, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.success) onSuccess?.();
    return result;
  }, undefined);

  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="label">
            Label (optional)
          </label>
          <Input id="label" name="label" placeholder="Home, Office…" defaultValue={defaultValues?.label ?? ""} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="fullName">
            Full name
          </label>
          <Input id="fullName" name="fullName" defaultValue={defaultValues?.fullName ?? ""} required />
          {errors?.fullName && <p className="text-sm text-saddle-700">{errors.fullName[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="line1">
            Address
          </label>
          <Input id="line1" name="line1" defaultValue={defaultValues?.line1 ?? ""} required />
          {errors?.line1 && <p className="text-sm text-saddle-700">{errors.line1[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="line2">
            Apt, suite, etc. (optional)
          </label>
          <Input id="line2" name="line2" defaultValue={defaultValues?.line2 ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="city">
            City
          </label>
          <Input id="city" name="city" defaultValue={defaultValues?.city ?? ""} required />
          {errors?.city && <p className="text-sm text-saddle-700">{errors.city[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="state">
            State
          </label>
          <Input id="state" name="state" defaultValue={defaultValues?.state ?? ""} required />
          {errors?.state && <p className="text-sm text-saddle-700">{errors.state[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="postalCode">
            ZIP code
          </label>
          <Input id="postalCode" name="postalCode" defaultValue={defaultValues?.postalCode ?? ""} required />
          {errors?.postalCode && <p className="text-sm text-saddle-700">{errors.postalCode[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="phone">
            Phone (optional)
          </label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </div>

        <input type="hidden" name="country" value={defaultValues?.country ?? "US"} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={defaultValues?.isDefault ?? false} />
        Set as default address
      </label>

      {state && !state.success && state.message && (
        <p className="text-sm text-saddle-700">{state.message}</p>
      )}

      <Button type="submit" loading={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
