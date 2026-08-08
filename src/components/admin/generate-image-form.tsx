"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { generatePlaceholderProductImage } from "@/server/actions/admin-ai-image";

type Props = {
  productId: string;
  name: string;
  categoryName: string;
  materials: string[];
};

export function GenerateImageForm({ productId, name, categoryName, materials }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleGenerate() {
    setMessage(null);
    startTransition(async () => {
      const result = await generatePlaceholderProductImage(productId, {
        name,
        categoryName,
        materials: materials.join(", "),
      });
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      setMessage("Draft photo added — swap it for real photography when available.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="secondary" loading={isPending} onClick={handleGenerate}>
        {isPending ? "Generating…" : "✨ Generate Draft Product Photo"}
      </Button>
      {message && <p className="text-xs text-ink/70">{message}</p>}
    </div>
  );
}
