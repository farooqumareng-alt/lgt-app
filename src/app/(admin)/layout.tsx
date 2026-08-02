export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 px-6 py-4">
        <span className="font-display text-xl">Admin</span>
      </header>
      <main>{children}</main>
    </div>
  );
}
