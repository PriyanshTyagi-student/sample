import { ReactNode } from "react";
import { PermissionGate } from "@/components/PermissionGate";
import { AdminLayout } from "@/components/AdminLayout";

export const metadata = {
  title: "Admin Dashboard - TechMNHub",
  description: "Manage sessions, students, ambassadors, and more",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate
      permissions="dashboard.view"
      fallback={<div className="flex items-center justify-center min-h-screen">Access Denied</div>}
    >
      <AdminLayout>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </AdminLayout>
    </PermissionGate>
  );
}
