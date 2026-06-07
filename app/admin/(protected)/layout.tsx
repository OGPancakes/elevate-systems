import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
