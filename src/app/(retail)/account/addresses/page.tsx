import type { Metadata } from "next";

import { AddressCard } from "@/components/retail/address-card";
import { NewAddressSection } from "@/components/retail/new-address-section";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false },
};

export default async function AddressesPage() {
  const session = await verifySession();
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Addresses</h1>

      {addresses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      <NewAddressSection />
    </div>
  );
}
