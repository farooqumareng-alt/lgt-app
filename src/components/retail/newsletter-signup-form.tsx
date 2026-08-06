"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/server/actions/newsletter";

export function NewsletterSignupForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: Awaited<ReturnType<typeof subscribeToNewsletter>> | undefined, formData: FormData) => {
    const result = await subscribeToNewsletter(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, undefined);

  if (state?.success) {
    return <p className="text-sm font-medium text-saddle-700">You&rsquo;re on the list — thank you.</p>;
  }

  return (
    <form ref={formRef} action={formAction} className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input id="newsletter-email" name="email" type="email" placeholder="you@example.com" required />
        {state && !state.success && state.errors?.email && (
          <p className="mt-1 text-xs text-saddle-700">{state.errors.email[0]}</p>
        )}
      </div>
      <Button type="submit" loading={pending} className="shrink-0">
        {pending ? "Signing up…" : "Sign Up"}
      </Button>
    </form>
  );
}
