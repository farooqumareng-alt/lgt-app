"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORE_TYPES } from "@/lib/validation/wholesale";
import { updateWholesaleAccountAdmin } from "@/server/actions/wholesale-admin";

type BusinessAddress = {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
};

type Props = {
  accountId: string;
  businessName: string;
  phone: string;
  website: string | null;
  storeType: string | null;
  taxId: string | null;
  ein: string | null;
  businessAddress: BusinessAddress | null;
  netTermsDays: number | null;
  creditLimit: number | null;
  minimumOrderValue: number | null;
};

export function WholesaleAccountEditForm(props: Props) {
  const boundAction = updateWholesaleAccountAdmin.bind(null, props.accountId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const errors = state && !state.success ? state.errors : undefined;
  const address = props.businessAddress ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-medium sm:col-span-2">Business Information</legend>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="businessName">
            Business name
          </label>
          <Input id="businessName" name="businessName" defaultValue={props.businessName} required />
          {errors?.businessName && <p className="text-xs text-saddle-700">{errors.businessName[0]}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="phone">
            Phone
          </label>
          <Input id="phone" name="phone" defaultValue={props.phone} required />
          {errors?.phone && <p className="text-xs text-saddle-700">{errors.phone[0]}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="website">
            Website
          </label>
          <Input id="website" name="website" defaultValue={props.website ?? ""} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="storeType">
            Store type
          </label>
          <select
            id="storeType"
            name="storeType"
            defaultValue={props.storeType ?? ""}
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          >
            <option value="">—</option>
            {STORE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="taxId">
            Resale cert / Tax ID
          </label>
          <Input id="taxId" name="taxId" defaultValue={props.taxId ?? ""} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="ein">
            EIN
          </label>
          <Input id="ein" name="ein" defaultValue={props.ein ?? ""} />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-medium sm:col-span-3">Business Address</legend>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-ink/70" htmlFor="addressLine1">
            Address
          </label>
          <Input id="addressLine1" name="addressLine1" defaultValue={address.line1 ?? ""} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="addressLine2">
            Suite / unit
          </label>
          <Input id="addressLine2" name="addressLine2" defaultValue={address.line2 ?? ""} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="addressCity">
            City
          </label>
          <Input id="addressCity" name="addressCity" defaultValue={address.city ?? ""} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="addressState">
            State
          </label>
          <Input id="addressState" name="addressState" defaultValue={address.state ?? ""} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="addressPostalCode">
            ZIP
          </label>
          <Input id="addressPostalCode" name="addressPostalCode" defaultValue={address.postalCode ?? ""} />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-medium sm:col-span-3">Account Terms</legend>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="netTermsDays">
            Net terms (days, blank = card only)
          </label>
          <Input
            id="netTermsDays"
            name="netTermsDays"
            type="number"
            min="0"
            defaultValue={props.netTermsDays ?? ""}
          />
          {errors?.netTermsDays && <p className="text-xs text-saddle-700">{errors.netTermsDays[0]}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="creditLimit">
            Credit limit ($)
          </label>
          <Input
            id="creditLimit"
            name="creditLimit"
            type="number"
            step="0.01"
            min="0"
            defaultValue={props.creditLimit ?? ""}
          />
          {errors?.creditLimit && <p className="text-xs text-saddle-700">{errors.creditLimit[0]}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ink/70" htmlFor="minimumOrderValue">
            Minimum order ($)
          </label>
          <Input
            id="minimumOrderValue"
            name="minimumOrderValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={props.minimumOrderValue ?? ""}
          />
          {errors?.minimumOrderValue && <p className="text-xs text-saddle-700">{errors.minimumOrderValue[0]}</p>}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : "Save Changes"}
        </Button>
        {state?.success && <p className="text-sm text-ink/70">Saved.</p>}
      </div>
    </form>
  );
}
