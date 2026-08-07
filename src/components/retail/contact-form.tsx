"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContactMessage } from "@/server/actions/contact";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  if (state?.success) {
    return (
      <div className="rounded-sm border border-cream-200 bg-cream-50 p-8 text-center">
        <p className="font-display text-2xl">Message sent</p>
        <p className="mt-2 text-ink/70">Thanks — we&apos;ve received your message and will get back to you.</p>
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
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="orderNumber">
          Order number (optional)
        </label>
        <Input id="orderNumber" name="orderNumber" placeholder="LGT-100042" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={2000}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
        />
        {errors?.message && <p className="text-sm text-saddle-700">{errors.message[0]}</p>}
      </div>

      {state && !state.success && state.message && (
        <p className="text-sm text-saddle-700">{state.message}</p>
      )}

      <Button type="submit" loading={pending}>
        {pending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
