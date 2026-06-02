import { AdminView } from "@/components/app/admin/admin-view";
import { getAdminData, requireAdmin } from "@/lib/admin/customers";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const { customers, overview } = await getAdminData();

  return (
    <AdminView customers={customers} overview={overview} currentAdminId={admin.id} />
  );
}
