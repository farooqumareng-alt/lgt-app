"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ProductImagePlaceholder } from "@/components/retail/product-image-placeholder";

type GalleryImage = { id: string; url: string; altText: string };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-sm border border-cream-200">
        <ProductImagePlaceholder />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-sm border border-cream-200">
        <Image
          key={activeImage.id}
          src={activeImage.url}
          alt={activeImage.altText}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1} of ${productName}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-sm border transition-colors duration-150",
                index === activeIndex ? "border-saddle" : "border-cream-200 hover:border-saddle/50",
              )}
            >
              <Image src={image.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
