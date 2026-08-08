import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-cream-50 lg:flex">
      <AdminSidebar userEmail={session?.user?.email} logoutAction={logout} />
      {/* No overflow-x-auto here on purpose — an ancestor with any overflow
          other than visible becomes the containing block for descendant
          `position: sticky` elements (like the product-edit page's sticky
          save bar), and since this element never actually needs to scroll
          independently (the document itself does), that silently broke
          sticky positioning for every admin page. `min-w-0` alone already
          does the real work of letting this flex child shrink below its
          content's intrinsic width, which is what actually prevents a wide
          child from blowing out the sidebar layout. Anything genuinely wide
          (a data table, etc.) should get its own local overflow-x-auto
          wrapper instead of relying on this one being a global safety net. */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
