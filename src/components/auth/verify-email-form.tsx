"use client";

import { useActionState, useState, useTransition } from "react";

import { resendVerificationCode, verifyEmail } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyEmailForm({ email, next }: { email: string; next?: string }) {
  const [state, formAction, pending] = useActionState(verifyEmail, undefined);
  const [isResending, startResend] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  function handleResend() {
    startResend(async () => {
      const result = await resendVerificationCode(email);
      setResendMessage(result?.message ?? null);
    });
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        {next && <input type="hidden" name="next" value={next} />}
        <div className="space-y-1">
          <label htmlFor="code" className="text-sm font-medium">
            Verification code
          </label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            required
          />
        </div>

        {state && !state.success && <p className="text-sm text-saddle-700">{state.message}</p>}

        <Button type="submit" loading={pending} className="w-full">
          {pending ? "Verifying…" : "Verify Email"}
        </Button>
      </form>

      <div className="text-center text-sm text-ink/70">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-medium text-saddle hover:underline disabled:opacity-50"
        >
          {isResending ? "Sending…" : "Resend code"}
        </button>
        {resendMessage && <p className="mt-1 text-ink/70">{resendMessage}</p>}
      </div>
    </div>
  );
}
