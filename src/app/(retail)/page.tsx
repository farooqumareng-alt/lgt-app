import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-saddle">
        Genuine Leather, Since Day One
      </p>
      <h1 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
        Belts, wallets, and handbags built to outlast trends.
      </h1>
      <p className="max-w-xl text-lg text-ink/70">
        Full-grain leather goods for individuals and businesses — with custom
        logo embossing available on every piece. Retail storefront and
        wholesale ordering, side by side.
      </p>
      <div className="flex gap-4">
        <ButtonLink href="/shop">Shop the Collection</ButtonLink>
        <ButtonLink href="/wholesale" variant="secondary">
          Wholesale Program
        </ButtonLink>
      </div>
    </section>
  );
}
