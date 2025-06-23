import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/Sidebar";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0" style={{ paddingLeft: "4rem" }}>
          <header className="h-16 px-6 bg-background shadow-sm flex justify-end items-center border-b border-border space-x-4">
            <ThemeToggle />
            <UserProfile />
          </header>
          <main className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div className="max-w-7xl w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
} 