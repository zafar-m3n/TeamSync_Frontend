import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "@/store/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRailExpandedChange={setRailExpanded}
      />

      <div
        className={clsx(
          "transition-[padding] duration-200 ease-in-out",
          railExpanded ? "lg:pl-64" : "lg:pl-16",
        )}
      >
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="min-h-[calc(100dvh-4rem)] bg-white px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
