import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl">Create your account</h1>
      <RegisterForm />
      <p className="text-sm text-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
