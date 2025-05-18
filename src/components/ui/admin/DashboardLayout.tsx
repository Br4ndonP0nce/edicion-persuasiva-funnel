// src/components/ui/admin/DashboardLayout.tsx - Updated with better mobile responsiveness
import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
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
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile based on viewport width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Leads", href: "/admin/leads", icon: Users },
    { name: "Estadísticas", href: "/admin/stats", icon: BarChart2 },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
    { name: "Contenido", href: "/admin/content", icon: FileText },
  ];

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

      {/* Sidebar - hidden on mobile by default, shown when sidebarOpen is true */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-purple-900 text-white transform transition-transform ease-in-out duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0`}
      >
        {/* Sidebar header with close button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-purple-800">
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/image/logo.jpg" // Make sure this path is correct
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

        {/* Sidebar navigation */}
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          <div className="px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-purple-800 text-white"
                    : "text-purple-200 hover:bg-purple-700 hover:text-white"
                }`}
                onClick={() => isMobile && setSidebarOpen(false)} // Close sidebar on mobile after clicking
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
        {/* Top header - always visible on mobile */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          {/* Mobile menu button - ALWAYS visible on mobile screens */}
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

              {/* Profile dropdown could go here */}
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
