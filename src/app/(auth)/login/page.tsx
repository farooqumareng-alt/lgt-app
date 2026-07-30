import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl">Sign in</h1>
      <LoginForm />
      <p className="text-sm text-ink/70">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
