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
  LogOut,
  Heart,
  Brain
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Player } from '@lordicon/react';

const menuItems = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: Activity },
  { id: "contact", path: "/patients", label: "Contato/CRM", icon: Users },
  { id: "scheduling", path: "/scheduling", label: "Agendamentos", icon: Calendar },

  { id: "transactions", path: "/transactions", label: "Lançamentos", icon: TrendingUp },
  { id: "inventory", path: "/inventory", label: "Estoque", icon: Package },
  { id: "sessions", path: "/sessions", label: "Sessões e Protocolos", icon: FileText },
  { id: "settings", path: "/settings", label: "Configurações", icon: SettingsIcon },
];

// Item especial para Cultura/Saúde que ficará por último
const specialMenuItem = {
  id: "culture",
  icon: Heart,
  subItems: [
    { id: "culture-main", path: "/culture", label: "Cultura Organizacional" },
    { id: "health-main", path: "/health", label: "Saúde" },
  ],
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

const handleSpecialNavigation = () => {
  console.log('Current path:', location.pathname); // Para debug
  // Se estiver em /health, vai para /culture, senão vai para /culture
  if (location.pathname.startsWith('/health')) {
    console.log('Navigating to culture');
    navigate('/culture');
  } else if (location.pathname.startsWith('/culture')) {
    console.log('Navigating to health');
    navigate('/health');
  } else {
    // Se não estiver em nenhuma das duas, vai para culture por padrão
    console.log('Navigating to culture (default)');
    navigate('/culture');
  }
};

  // Detectar se está na página de Health
  const isHealthPage = location.pathname.startsWith('/health');
  
  // CSS para esconder scrollbar - removido os estilos problemáticos
  const scrollbarHideClass = `
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <TooltipProvider delayDuration={100}> {/* Reduzir o delay */}
      <style>{scrollbarHideClass}</style>
      <Sidebar className={cn(
        "w-16 border-r h-screen flex flex-col overflow-hidden",
        isHealthPage 
          ? "border-gray-700 bg-gray-900" 
          : "border-sidebar-border"
      )}>
        <SidebarHeader className={cn(
          "border-b p-4 flex-shrink-0",
          isHealthPage 
            ? "border-gray-700 bg-gray-900" 
            : "border-sidebar-border"
        )}>
          <div className="flex items-center justify-center">
            <div className={cn(
              "p-2 rounded-lg",
              isHealthPage 
                ? "bg-gray-700" 
                : "bg-primary"
            )}>
              <Stethoscope className={cn(
                "h-5 w-5",
                isHealthPage 
                  ? "text-gray-300" 
                  : "text-primary-foreground"
              )} />
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide",
          isHealthPage ? "bg-gray-900" : ""
        )}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Itens normais */}
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          isActive={location.pathname === item.path || (item.id === "dashboard" && location.pathname === "/")}
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            "w-12 h-12 mx-auto rounded-lg transition-all duration-200 flex items-center justify-center flex-shrink-0 group",
                            isHealthPage 
                              ? "hover:bg-gray-700" 
                              : "hover:bg-sidebar-accent/50",
                            location.pathname === item.path || (item.id === "dashboard" && location.pathname === "/")
                              ? isHealthPage 
                                ? "bg-gray-700 text-gray-300" 
                                : "bg-sidebar-accent text-sidebar-accent-foreground"
                              : isHealthPage 
                                ? "text-gray-400 hover:text-gray-300" 
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5",
                            location.pathname === item.path || (item.id === "dashboard" && location.pathname === "/")
                              ? isHealthPage 
                                ? "text-gray-300" 
                                : "text-sidebar-accent-foreground"
                              : isHealthPage 
                                ? "text-gray-400 group-hover:text-gray-300" 
                                : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                          )} />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className={cn(
                        isHealthPage 
                          ? "bg-gray-800 text-gray-300 border-gray-700" 
                          : "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
                
                {/* Separador */}
                <div className={cn(
                  "my-1 border-t",
                  isHealthPage 
                    ? "border-gray-700" 
                    : "border-sidebar-border/50"
                )} />
                
                {/* Item especial com efeito diferente */}
                <SidebarMenuItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <SidebarMenuButton
                        isActive={specialMenuItem.subItems.some((sub) => location.pathname.startsWith(sub.path))}
                        className={cn(
                          "w-12 h-12 mx-auto rounded-lg transition-all duration-300 flex items-center justify-center flex-shrink-0 group",
                          isHealthPage 
                            ? "hover:bg-gray-700 hover:scale-110 border-2 border-transparent hover:border-gray-600"
                            : "hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-red-500/20 hover:scale-110 border-2 border-transparent hover:border-pink-400/30",
                          "animate-pulse",
                          specialMenuItem.subItems.some((sub) => location.pathname.startsWith(sub.path))
                            ? isHealthPage 
                              ? "bg-gray-700 text-gray-300 border-gray-600 animate-none"
                              : "bg-gradient-to-r from-pink-500/30 to-red-500/30 text-pink-400 border-pink-400/50 animate-none"
                            : isHealthPage 
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-sidebar-foreground/70 hover:text-pink-400"
                        )}
                      >
                        <specialMenuItem.icon className={cn(
                          "h-5 w-5",
                          specialMenuItem.subItems.some((sub) => location.pathname.startsWith(sub.path))
                            ? isHealthPage 
                              ? "text-gray-300" 
                              : "text-pink-400"
                            : isHealthPage 
                              ? "text-gray-400 group-hover:text-gray-300" 
                              : "text-sidebar-foreground/70 group-hover:text-pink-400"
                        )} />
                      </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent 
                      side="right" 
                      className={cn(
                        "w-auto p-2",
                        isHealthPage 
                          ? "bg-gray-800 text-gray-300 border-gray-700" 
                          : "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      sideOffset={8}
                    >
                      <div className="flex flex-col space-y-1">
                        {specialMenuItem.subItems.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleNavigation(sub.path)}
                            className={cn(
                              "text-left px-4 py-3 rounded-lg transition-all duration-200 w-full text-sm font-medium min-w-[160px]",
                              isHealthPage 
                                ? "hover:bg-gray-700 border border-transparent hover:border-gray-600"
                                : "hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-red-500/20 border border-transparent hover:border-pink-400/30",
                              location.pathname === sub.path 
                                ? isHealthPage 
                                  ? "bg-gray-700 text-gray-300 border-gray-600 font-bold" 
                                  : "bg-gradient-to-r from-pink-500/30 to-red-500/30 text-pink-400 border-pink-400/50 font-bold" 
                                : isHealthPage 
                                  ? "text-gray-400 hover:text-gray-300"
                                  : "text-sidebar-accent-foreground/80 hover:text-pink-400"
                            )}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}