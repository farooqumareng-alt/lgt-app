import { prisma } from "@/lib/prisma";

const productCardSelect = {
  slug: true,
  name: true,
  basePriceRetail: true,
  isFeatured: true,
  category: { select: { urlSlug: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, altText: true },
  },
} as const;

type ProductCardRow = {
  slug: string;
  name: string;
  basePriceRetail: unknown;
  isFeatured: boolean;
  category: { urlSlug: string };
  images: { url: string; altText: string }[];
};

function toCardDto(product: ProductCardRow) {
  return {
    slug: product.slug,
    name: product.name,
    price: Number(product.basePriceRetail),
    isFeatured: product.isFeatured,
    categoryUrlSlug: product.category.urlSlug,
    image: product.images[0] ?? null,
  };
}

export function getActiveCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getCategoryByUrlSlug(urlSlug: string) {
  return prisma.category.findUnique({ where: { urlSlug } });
}

export async function getActiveProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: productCardSelect,
    orderBy: { name: "asc" },
  });
  return products.map(toCardDto);
}

export async function getProductsByCategoryId(categoryId: string) {
  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId },
    select: productCardSelect,
    orderBy: { name: "asc" },
  });
  return products.map(toCardDto);
}

export async function getFeaturedProducts(limit = 4) {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: productCardSelect,
    orderBy: { name: "asc" },
    take: limit,
  });
  return products.map(toCardDto);
}

// Lightweight — just enough for a <select> option list (custom-request form).
export function getCustomizableProductOptions() {
  return prisma.product.findMany({
    where: { isActive: true, isCustomizable: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getCustomizableProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isCustomizable: true },
    select: productCardSelect,
    orderBy: { name: "asc" },
  });
  return products.map(toCardDto);
}

export async function getProductDetail(categoryUrlSlug: string, slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, category: { urlSlug: categoryUrlSlug } },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
    },
  });
  if (!product) return null;

  return {
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    materials: product.materials,
    isCustomizable: product.isCustomizable,
    basePrice: Number(product.basePriceRetail),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    category: { name: product.category.name, urlSlug: product.category.urlSlug },
    images: product.images.map((image) => ({
      url: image.url,
      altText: image.altText,
      isPrimary: image.isPrimary,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      size: variant.size,
      priceRetailOverride: variant.priceRetailOverride
        ? Number(variant.priceRetailOverride)
        : null,
      stockQuantity: variant.stockQuantity,
    })),
  };
}
