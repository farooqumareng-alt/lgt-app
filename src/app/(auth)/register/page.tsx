import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <Card className="p-8 shadow-sm sm:p-10">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl">Create your account</h1>
          <p className="text-sm text-ink/70">Join Leather Goods Texas to track orders and save your details</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-saddle hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}
