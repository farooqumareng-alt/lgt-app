"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changeEmail,
  changePassword,
  updateProfile,
  type AccountActionResult,
} from "@/server/actions/account";

function StatusMessage({ state }: { state: AccountActionResult | undefined }) {
  if (!state) return null;
  if (state.success && state.message) {
    return <p className="text-sm text-ink/70">{state.message}</p>;
  }
  if (!state.success && state.message) {
    return <p className="text-sm text-saddle-700">{state.message}</p>;
  }
  return null;
}

export function ProfileForm({ name }: { name: string | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="name">
          Name
        </label>
        <Input id="name" name="name" defaultValue={name ?? ""} required />
        {errors?.name && <p className="text-sm text-saddle-700">{errors.name[0]}</p>}
      </div>
      <StatusMessage state={state} />
      <Button type="submit" loading={pending}>
        {pending ? "Saving…" : "Save Name"}
      </Button>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(changeEmail, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
        {errors?.email && <p className="text-sm text-saddle-700">{errors.email[0]}</p>}
      </div>
      <StatusMessage state={state} />
      <Button type="submit" loading={pending}>
        {pending ? "Saving…" : "Save Email"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="currentPassword">
          Current password
        </label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
        {errors?.currentPassword && (
          <p className="text-sm text-saddle-700">{errors.currentPassword[0]}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="newPassword">
          New password
        </label>
        <Input id="newPassword" name="newPassword" type="password" required />
        {errors?.newPassword && <p className="text-sm text-saddle-700">{errors.newPassword[0]}</p>}
      </div>
      <StatusMessage state={state} />
      <Button type="submit" loading={pending}>
        {pending ? "Saving…" : "Change Password"}
      </Button>
    </form>
  );
}
