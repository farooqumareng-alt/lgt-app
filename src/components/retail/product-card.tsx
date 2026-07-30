import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductImagePlaceholder } from "@/components/retail/product-image-placeholder";

type ProductCardProps = {
  slug: string;
  categoryUrlSlug: string;
  name: string;
  price: number;
  isFeatured?: boolean;
  image?: { url: string; altText: string } | null;
};

export function ProductCard({
  slug,
  categoryUrlSlug,
  name,
  price,
  isFeatured,
  image,
}: ProductCardProps) {
  return (
    <Link href={`/shop/${categoryUrlSlug}/${slug}`} className="group block">
      <Card className="overflow-hidden transition-colors group-hover:border-saddle">
        <div className="relative aspect-square">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <ProductImagePlaceholder />
          )}
        </div>
        <div className="space-y-1.5 p-4">
          {isFeatured && <Badge variant="solid">Featured</Badge>}
          <p className="font-medium text-ink">{name}</p>
          <p className="text-sm text-ink/70">${price.toFixed(2)}</p>
        </div>
      </Card>
    </Link>
  );
}
