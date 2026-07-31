import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-200/40 px-4 py-16">
      <Link href="/" className="mb-6">
        <Image
          src="/logo.png"
          alt="Leather Goods Texas"
          width={769}
          height={756}
          className="h-32 w-auto sm:h-36"
          priority
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
