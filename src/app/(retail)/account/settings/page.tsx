import type { Metadata } from "next";

import {
  EmailForm,
  PasswordForm,
  ProfileForm,
} from "@/components/retail/account-settings-forms";
import { Card } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default async function SettingsPage() {
  const session = await verifySession();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Settings</h1>

      <Card className="p-6">
        <h2 className="mb-4 font-medium">Profile</h2>
        <ProfileForm name={session.user.name ?? null} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-medium">Email</h2>
        <EmailForm email={session.user.email ?? ""} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-medium">Password</h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
