import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/Sidebar";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const location = useLocation();
  const isHealthPage = location.pathname.startsWith('/health');
  
  return (
    <div className={cn(
      "flex min-h-screen",
      isHealthPage ? "bg-gray-900" : "bg-background"
    )}>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 ml-16">
          <header className={cn(
            "h-16 px-6 shadow-sm flex justify-end items-center border-b space-x-4 flex-shrink-0",
            isHealthPage 
              ? "bg-gray-900 border-gray-700" 
              : "bg-background border-border"
          )}>
            <ThemeToggle />
            <UserProfile />
          </header>
          <main className="flex-1 p-6">
            <div className="max-w-7xl w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
} 