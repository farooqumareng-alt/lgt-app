import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="flex items-center gap-6 border-b border-cream-200 px-6 py-4">
        <Link href="/admin" className="font-display text-xl hover:text-saddle">
          Admin
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin" className="hover:text-saddle">
            Dashboard
          </Link>
          <Link href="/admin/products" className="hover:text-saddle">
            Products
          </Link>
          <Link href="/admin/orders" className="hover:text-saddle">
            Orders
          </Link>
          <Link href="/admin/customers" className="hover:text-saddle">
            Customers
          </Link>
          <Link href="/admin/wholesale-applications" className="hover:text-saddle">
            Wholesale Applications
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
