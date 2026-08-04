import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign In",
};

type Props = { searchParams: Promise<{ verified?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { verified } = await searchParams;

  return (
    <Card className="p-8 shadow-sm sm:p-10">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl">Welcome back</h1>
          <p className="text-sm text-ink/60">Sign in to your Leather Goods Texas account</p>
        </div>
        {verified === "1" && (
          <p className="rounded-sm border border-saddle-700 bg-saddle-50 p-3 text-center text-sm text-saddle-700">
            Email verified — you can sign in now.
          </p>
        )}
        <LoginForm />
        <p className="text-center text-sm text-ink/70">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-saddle hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </Card>
  );
}
