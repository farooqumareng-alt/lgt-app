import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-cream-50 lg:flex">
      <AdminSidebar userEmail={session?.user?.email} logoutAction={logout} />
      <main className="min-w-0 flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
