"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteProductImage, setImagePrimary } from "@/server/actions/admin-images";

type ProductImage = { id: string; url: string; altText: string; isPrimary: boolean };

export function ProductImageGallery({ images }: { images: ProductImage[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (images.length === 0) {
    return <p className="text-sm text-ink/70">No images uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((image) => (
        <div key={image.id} className="space-y-1 rounded-sm border border-cream-200 p-2">
          <div className="relative aspect-square overflow-hidden rounded-sm bg-cream-100">
            <Image src={image.url} alt={image.altText} fill className="object-cover" sizes="150px" />
          </div>
          <p className="truncate text-xs text-ink/70">{image.altText}</p>
          <div className="flex items-center justify-between text-xs">
            {image.isPrimary ? (
              <span className="font-medium text-saddle">Primary</span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await setImagePrimary(image.id);
                    router.refresh();
                  })
                }
                className="text-saddle hover:underline"
              >
                Set primary
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteProductImage(image.id);
                  router.refresh();
                })
              }
              className="text-ink/70 hover:text-saddle-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
