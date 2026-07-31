"use client";

import { useState } from "react";

import { AddressForm } from "@/components/retail/address-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createAddress } from "@/server/actions/addresses";

export function NewAddressSection() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add New Address
      </Button>
    );
  }

  return (
    <Card className="p-6">
      <AddressForm action={createAddress} submitLabel="Add Address" onSuccess={() => setOpen(false)} />
      <button type="button" onClick={() => setOpen(false)} className="mt-3 text-sm text-ink/50 underline">
        Cancel
      </button>
    </Card>
  );
}
