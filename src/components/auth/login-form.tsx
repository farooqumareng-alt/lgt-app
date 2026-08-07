"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { login } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-saddle-700">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.errors?.password && (
          <p className="text-sm text-saddle-700">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-saddle-700">
          {state.message}
          {state.needsVerification && (
            <>
              {" "}
              <Link
                href={`/verify-email?email=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`}
                className="underline"
              >
                Verify now
              </Link>
            </>
          )}
        </p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
