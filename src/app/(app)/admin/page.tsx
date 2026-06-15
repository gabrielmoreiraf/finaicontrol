import { AdminView } from "@/components/app/admin/admin-view";
import { getAdminData, requireAdmin } from "@/lib/admin/customers";
import { listPendingInvitations } from "@/lib/auth/invitation";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [{ customers, overview }, invitations] = await Promise.all([
    getAdminData(),
    listPendingInvitations(),
  ]);

  return (
    <AdminView
      customers={customers}
      overview={overview}
      invitations={invitations}
      currentAdminId={admin.id}
    />
  );
}
