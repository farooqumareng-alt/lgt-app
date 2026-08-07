import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verify Your Email",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ email?: string; next?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email, next } = await searchParams;
  if (!email) redirect("/register");

  return (
    <Card className="p-8 shadow-sm sm:p-10">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl">Verify your email</h1>
          <p className="text-sm text-ink/70">
            We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>
          </p>
        </div>
        <VerifyEmailForm email={email} next={next} />
      </div>
    </Card>
  );
}
