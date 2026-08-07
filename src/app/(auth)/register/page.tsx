import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create Account",
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const isWholesale = next === "/wholesale/apply";

  return (
    <Card className="p-8 shadow-sm sm:p-10">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl">
            {isWholesale ? "Create your account to apply" : "Create your account"}
          </h1>
          <p className="text-sm text-ink/70">
            {isWholesale
              ? "Start your wholesale application — verify your email, then tell us about your business."
              : "Join Leather Goods Texas to track orders and save your details"}
          </p>
        </div>
        <RegisterForm next={next} />
        <p className="text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-medium text-saddle hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}
