"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCustomerAdmin } from "@/server/actions/admin-customers";

export function CustomerEditForm({ userId, name, email }: { userId: string; name: string; email: string }) {
  const boundAction = updateCustomerAdmin.bind(null, userId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <label className="text-xs text-ink/70" htmlFor="name">
          Name
        </label>
        <Input id="name" name="name" defaultValue={name} required />
        {errors?.name && <p className="text-xs text-saddle-700">{errors.name[0]}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs text-ink/70" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
        {errors?.email && <p className="text-xs text-saddle-700">{errors.email[0]}</p>}
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" variant="secondary" loading={pending}>
          {pending ? "Saving…" : "Save Changes"}
        </Button>
        {state?.success && <p className="text-xs text-ink/70">Saved.</p>}
        {state && !state.success && state.message && <p className="text-xs text-saddle-700">{state.message}</p>}
      </div>
    </form>
  );
}
