"use client";

import { useState, useTransition } from "react";

import { AddressForm } from "@/components/retail/address-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { deleteAddress, setDefaultAddress, updateAddress } from "@/server/actions/addresses";

type Address = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

export function AddressCard({ address }: { address: Address }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="p-6">
        <AddressForm
          action={updateAddress.bind(null, address.id)}
          defaultValues={address}
          submitLabel="Update Address"
          onSuccess={() => setEditing(false)}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mt-3 text-sm text-ink/50 underline"
        >
          Cancel
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          {address.label && <p className="text-sm font-medium text-saddle">{address.label}</p>}
          {address.isDefault && <Badge variant="solid">Default</Badge>}
        </div>
      </div>
      <p className="mt-2 text-sm text-ink/80">
        {address.fullName}
        <br />
        {address.line1}
        {address.line2 ? <>, {address.line2}</> : null}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
        {address.phone && (
          <>
            <br />
            {address.phone}
          </>
        )}
      </p>
      <div className="mt-4 flex gap-4 text-sm">
        <button type="button" onClick={() => setEditing(true)} className="text-saddle hover:underline">
          Edit
        </button>
        {!address.isDefault && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => { await setDefaultAddress(address.id); })}
            className="text-saddle hover:underline"
          >
            Set as Default
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await deleteAddress(address.id); })}
          className="text-ink/50 hover:text-saddle-700"
        >
          Delete
        </button>
      </div>
    </Card>
  );
}
