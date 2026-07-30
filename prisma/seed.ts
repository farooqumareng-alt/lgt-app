import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { ProductCategorySlug } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type SeedVariant = { color?: string; size?: string; stockQuantity: number };

type SeedProduct = {
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  materials: string[];
  basePriceRetail: number;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  variants: SeedVariant[];
};

type SeedCategory = {
  slug: ProductCategorySlug;
  urlSlug: string;
  name: string;
  description: string;
  sortOrder: number;
  products: SeedProduct[];
};

const beltVariants: SeedVariant[] = [
  { color: "Black", size: "32", stockQuantity: 12 },
  { color: "Black", size: "36", stockQuantity: 14 },
  { color: "Black", size: "40", stockQuantity: 8 },
  { color: "Brown", size: "32", stockQuantity: 10 },
  { color: "Brown", size: "36", stockQuantity: 11 },
  { color: "Brown", size: "40", stockQuantity: 6 },
];

const CATEGORIES: SeedCategory[] = [
  {
    slug: "BELTS",
    urlSlug: "belts",
    name: "Belts",
    description: "Full-grain leather belts built to break in, not break down.",
    sortOrder: 1,
    products: [
      {
        slug: "heritage-full-grain-belt",
        sku: "BLT-001",
        name: "Heritage Full-Grain Belt",
        shortDescription: "A classic dress belt in full-grain leather with a solid brass buckle.",
        description:
          "Cut from a single piece of full-grain hide and finished with a solid brass buckle, the Heritage Belt is built for years of daily wear. It develops a rich patina over time rather than cracking or peeling.",
        materials: ["Full-grain leather", "Brass buckle"],
        basePriceRetail: 68,
        isFeatured: true,
        isCustomizable: true,
        variants: beltVariants,
      },
      {
        slug: "bridle-leather-dress-belt",
        sku: "BLT-002",
        name: "Bridle Leather Dress Belt",
        shortDescription: "A refined bridle-leather belt for suits and dress shoes.",
        description:
          "Made from bridle leather, prized for its density and smooth, waxed finish. A slightly narrower profile than our Heritage Belt, tailored for formal wear.",
        materials: ["Bridle leather", "Nickel-plated buckle"],
        basePriceRetail: 78,
        variants: beltVariants,
      },
      {
        slug: "reversible-everyday-belt",
        sku: "BLT-003",
        name: "Reversible Everyday Belt",
        shortDescription: "Black on one side, brown on the other — two belts in one.",
        description:
          "A practical, reversible belt with a rotating buckle — flip it to switch between black and brown without changing belts.",
        materials: ["Full-grain leather"],
        basePriceRetail: 72,
        variants: beltVariants,
      },
    ],
  },
  {
    slug: "WALLETS",
    urlSlug: "wallets",
    name: "Wallets",
    description: "Slim, durable wallets in full-grain and vegetable-tanned leather.",
    sortOrder: 2,
    products: [
      {
        slug: "bifold-card-wallet",
        sku: "WAL-001",
        name: "Bifold Card Wallet",
        shortDescription: "A slim bifold with six card slots and a center pocket.",
        description:
          "Our best-selling wallet: six card slots, a center bill pocket, and a low profile that fits comfortably in a front pocket.",
        materials: ["Full-grain leather"],
        basePriceRetail: 48,
        isFeatured: true,
        isCustomizable: true,
        variants: [
          { color: "Black", stockQuantity: 20 },
          { color: "Brown", stockQuantity: 18 },
          { color: "Tan", stockQuantity: 9 },
        ],
      },
      {
        slug: "slim-card-sleeve",
        sku: "WAL-002",
        name: "Slim Card Sleeve",
        shortDescription: "A minimalist sleeve for four cards and folded cash.",
        description:
          "For carrying less: a single sleeve that holds up to four cards plus folded bills, cut from a single piece of leather with no stitching on the front face.",
        materials: ["Vegetable-tanned leather"],
        basePriceRetail: 34,
        variants: [
          { color: "Black", stockQuantity: 15 },
          { color: "Brown", stockQuantity: 15 },
        ],
      },
      {
        slug: "trifold-traveler-wallet",
        sku: "WAL-003",
        name: "Trifold Traveler Wallet",
        shortDescription: "A trifold with a zippered coin pocket and passport slot.",
        description:
          "Built for travel: a zippered coin pocket, a slot sized for a passport, and eight card slots across three folding panels.",
        materials: ["Full-grain leather", "YKK zipper"],
        basePriceRetail: 56,
        isCustomizable: true,
        variants: [
          { color: "Black", stockQuantity: 10 },
          { color: "Brown", stockQuantity: 10 },
          { color: "Tan", stockQuantity: 5 },
        ],
      },
    ],
  },
  {
    slug: "KEYCHAINS",
    urlSlug: "keychains",
    name: "Keychains",
    description: "Small leather goods that make a good gift.",
    sortOrder: 3,
    products: [
      {
        slug: "monogram-leather-fob",
        sku: "KEY-001",
        name: "Monogram Leather Fob",
        shortDescription: "A simple leather fob, ready for a monogram or logo.",
        description:
          "A compact leather fob on a solid brass ring — our most popular canvas for a monogram, initials, or a small logo.",
        materials: ["Full-grain leather", "Brass ring"],
        basePriceRetail: 22,
        isCustomizable: true,
        variants: [
          { color: "Black", stockQuantity: 30 },
          { color: "Brown", stockQuantity: 28 },
          { color: "Tan", stockQuantity: 20 },
        ],
      },
      {
        slug: "compact-key-organizer",
        sku: "KEY-002",
        name: "Compact Key Organizer",
        shortDescription: "Keeps up to six keys folded flat and jangle-free.",
        description:
          "A folding leather organizer that holds up to six keys in place, with a carabiner clip for a belt loop or bag.",
        materials: ["Full-grain leather", "Steel hardware"],
        basePriceRetail: 28,
        variants: [
          { color: "Black", stockQuantity: 16 },
          { color: "Brown", stockQuantity: 14 },
        ],
      },
      {
        slug: "braided-leather-keychain",
        sku: "KEY-003",
        name: "Braided Leather Keychain",
        shortDescription: "A hand-braided leather strap with a brass clasp.",
        description:
          "Three leather cords, hand-braided into a single strap, finished with a solid brass clasp.",
        materials: ["Full-grain leather", "Brass clasp"],
        basePriceRetail: 18,
        isFeatured: true,
        variants: [
          { color: "Black", stockQuantity: 25 },
          { color: "Brown", stockQuantity: 22 },
          { color: "Tan", stockQuantity: 12 },
        ],
      },
    ],
  },
  {
    slug: "PURSES",
    urlSlug: "purses",
    name: "Purses",
    description: "Structured and everyday purses in full-grain leather.",
    sortOrder: 4,
    products: [
      {
        slug: "structured-satchel",
        sku: "PUR-001",
        name: "Structured Satchel",
        shortDescription: "A structured satchel with a detachable shoulder strap.",
        description:
          "A structured silhouette with a top handle and a detachable, adjustable shoulder strap. Interior includes a zippered pocket and two open slip pockets.",
        materials: ["Full-grain leather", "Cotton twill lining"],
        basePriceRetail: 148,
        isFeatured: true,
        variants: [
          { color: "Black", stockQuantity: 8 },
          { color: "Brown", stockQuantity: 6 },
          { color: "Cognac", stockQuantity: 5 },
        ],
      },
      {
        slug: "crossbody-purse",
        sku: "PUR-002",
        name: "Crossbody Purse",
        shortDescription: "A compact crossbody for daily essentials.",
        description:
          "A compact crossbody sized for a phone, cards, and keys, with an adjustable strap long enough to wear across the body.",
        materials: ["Full-grain leather"],
        basePriceRetail: 112,
        variants: [
          { color: "Black", stockQuantity: 9 },
          { color: "Cognac", stockQuantity: 7 },
        ],
      },
      {
        slug: "mini-clutch",
        sku: "PUR-003",
        name: "Mini Clutch",
        shortDescription: "A compact clutch with a magnetic snap closure.",
        description:
          "A minimalist clutch sized for an evening out — magnetic snap closure, a single interior pocket, and a wrist strap.",
        materials: ["Full-grain leather"],
        basePriceRetail: 86,
        isCustomizable: true,
        variants: [
          { color: "Black", stockQuantity: 10 },
          { color: "Brown", stockQuantity: 8 },
          { color: "Cognac", stockQuantity: 6 },
        ],
      },
    ],
  },
  {
    slug: "HANDBAGS",
    urlSlug: "handbags",
    name: "Handbags",
    description: "Totes and top-handle handbags for everyday carry.",
    sortOrder: 5,
    products: [
      {
        slug: "weekender-tote",
        sku: "BAG-001",
        name: "Weekender Tote",
        shortDescription: "An oversized tote built for a short trip.",
        description:
          "Roomy enough for an overnight trip, with reinforced handles and a wide-open top for easy packing. A zippered interior pocket keeps small items secure.",
        materials: ["Full-grain leather", "Cotton twill lining"],
        basePriceRetail: 168,
        isFeatured: true,
        variants: [
          { color: "Black", stockQuantity: 6 },
          { color: "Brown", stockQuantity: 5 },
          { color: "Cognac", stockQuantity: 4 },
        ],
      },
      {
        slug: "everyday-tote",
        sku: "BAG-002",
        name: "Everyday Tote",
        shortDescription: "A right-sized tote for work and errands.",
        description:
          "Sized for a laptop, a folder, and the rest of a normal day — sturdy handles, a flat base, and a magnetic closure.",
        materials: ["Full-grain leather"],
        basePriceRetail: 134,
        variants: [
          { color: "Black", stockQuantity: 8 },
          { color: "Cognac", stockQuantity: 5 },
        ],
      },
      {
        slug: "top-handle-handbag",
        sku: "BAG-003",
        name: "Top-Handle Handbag",
        shortDescription: "A structured top-handle bag with a detachable strap.",
        description:
          "A structured top-handle silhouette with a detachable, adjustable shoulder strap for hands-free carry when needed.",
        materials: ["Full-grain leather", "Brass hardware"],
        basePriceRetail: 156,
        isCustomizable: true,
        variants: [
          { color: "Black", stockQuantity: 7 },
          { color: "Brown", stockQuantity: 6 },
          { color: "Cognac", stockQuantity: 4 },
        ],
      },
    ],
  },
];

async function seedCatalog() {
  for (const categoryData of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { urlSlug: categoryData.urlSlug },
      update: {
        slug: categoryData.slug,
        name: categoryData.name,
        description: categoryData.description,
        sortOrder: categoryData.sortOrder,
      },
      create: {
        slug: categoryData.slug,
        urlSlug: categoryData.urlSlug,
        name: categoryData.name,
        description: categoryData.description,
        sortOrder: categoryData.sortOrder,
      },
    });

    for (const productData of categoryData.products) {
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          sku: productData.sku,
          categoryId: category.id,
          name: productData.name,
          shortDescription: productData.shortDescription,
          description: productData.description,
          materials: productData.materials,
          basePriceRetail: productData.basePriceRetail,
          isFeatured: productData.isFeatured ?? false,
          isCustomizable: productData.isCustomizable ?? false,
        },
        create: {
          slug: productData.slug,
          sku: productData.sku,
          categoryId: category.id,
          name: productData.name,
          shortDescription: productData.shortDescription,
          description: productData.description,
          materials: productData.materials,
          basePriceRetail: productData.basePriceRetail,
          isFeatured: productData.isFeatured ?? false,
          isCustomizable: productData.isCustomizable ?? false,
        },
      });

      for (const [index, variant] of productData.variants.entries()) {
        const variantSku = `${productData.sku}-${index + 1}`;
        await prisma.productVariant.upsert({
          where: { sku: variantSku },
          update: {
            color: variant.color,
            size: variant.size,
            stockQuantity: variant.stockQuantity,
          },
          create: {
            productId: product.id,
            sku: variantSku,
            color: variant.color,
            size: variant.size,
            stockQuantity: variant.stockQuantity,
          },
        });
      }
    }
  }

  const productCount = CATEGORIES.reduce((sum, c) => sum + c.products.length, 0);
  console.log(`Seeded ${CATEGORIES.length} categories, ${productCount} products.`);
}

// Catalog content belongs in every environment, including production — this is the
// only thing `prisma db seed` / `migrations.seed` runs. Local-only dev fixtures
// (e.g. a throwaway admin login) live in `seed-dev.ts` instead, run manually and
// never pointed at a production DATABASE_URL.
seedCatalog()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
