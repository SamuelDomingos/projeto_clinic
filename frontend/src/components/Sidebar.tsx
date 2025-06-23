import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Settings as SettingsIcon,
  Activity,
  Stethoscope,
  Receipt,
  TrendingUp,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: Activity },
  { id: "contact", path: "/patients", label: "Contato/CRM", icon: Users },
  { id: "scheduling", path: "/scheduling", label: "Agendamentos", icon: Calendar },
  { id: "invoices", path: "/invoices", label: "Faturas e Orçamentos", icon: Receipt },
  { id: "transactions", path: "/transactions", label: "Lançamentos", icon: TrendingUp },
  { id: "inventory", path: "/inventory", label: "Estoque", icon: Package },
  { id: "sessions", path: "/sessions", label: "Sessões e Protocolos", icon: FileText },
  { id: "settings", path: "/settings", label: "Configurações", icon: SettingsIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar className="w-16 border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center justify-center">
            <div className="p-2 bg-primary rounded-lg">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          isActive={location.pathname === item.path || (item.id === "dashboard" && location.pathname === "/")}
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            "w-12 h-12 mx-auto rounded-lg transition-all duration-200 flex items-center justify-center",
                            "hover:bg-sidebar-accent/50",
                            (location.pathname === item.path || (item.id === "dashboard" && location.pathname === "/")) 
                              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-accent-foreground">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                onClick={logout}
                className="w-12 h-12 mx-auto rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <LogOut className="h-5 w-5" />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-accent-foreground">
              Sair
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
