// src/components/ui/admin/DashboardLayout.tsx - Updated with Activos navigation
import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  Home,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  FileText,
  UserCog,
  Shield,
  CheckCircle,
  CreditCard,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { userProfile, hasPermission } = useAuth();

  // Check if the device is mobile based on viewport width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Dynamic navigation based on user permissions - UPDATED with Activos
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      permission: "dashboard:read" as const,
    },
    {
      name: "Leads",
      href: "/admin/leads",
      icon: Users,
      permission: "leads:read" as const,
    },
    {
      name: "Activos",
      href: "/admin/activos",
      icon: CheckCircle,
      permission: "active_members:read" as const,
    },
    {
      name: "Estadísticas",
      href: "/admin/stats",
      icon: BarChart2,
      permission: "stats:read" as const,
    },
    {
      name: "Ventas",
      href: "/admin/ventas",
      icon: CreditCard,
      permission: "users:read" as const,
    },
    {
      name: "Contenido",
      href: "/admin/content",
      icon: FileText,
      permission: "content:read" as const,
    },
    {
      name: "Usuarios",
      href: "/admin/users",
      icon: UserCog,
      permission: "users:read" as const,
    },
    {
      name: "Configuración",
      href: "/admin/settings",
      icon: Settings,
      permission: "settings:read" as const,
    },
  ];

  // Filter navigation items based on user permissions
  const accessibleNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  );

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true;
    }
    return pathname?.startsWith(path) && path !== "/admin";
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 z-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-purple-900 text-white transform transition-transform ease-in-out duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-purple-800">
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/image/logo.jpg"
                alt="Edición Persuasiva"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-purple-200 hover:text-white focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-purple-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() ||
                    userProfile?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {userProfile?.displayName || userProfile?.email}
              </p>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-purple-300" />
                <p className="text-xs text-purple-300 capitalize">
                  {userProfile?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          <div className="px-2 space-y-1">
            {accessibleNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-purple-800 text-white"
                    : "text-purple-200 hover:bg-purple-700 hover:text-white"
                }`}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? "text-purple-200"
                      : "text-purple-300 group-hover:text-purple-200"
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 flex border-t border-purple-800 p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-purple-200 rounded-md hover:bg-purple-700 hover:text-white"
          >
            <LogOut className="mr-2 h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Optional search bar could go here */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
