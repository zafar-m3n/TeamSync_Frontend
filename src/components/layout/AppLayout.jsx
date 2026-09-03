import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
