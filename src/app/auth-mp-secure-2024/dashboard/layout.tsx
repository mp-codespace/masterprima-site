// File path: src/app/auth-mp-secure-2024/dashboard/layout.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  // Users,
  // Shield,
  DollarSign,
  LogOut,
  Menu,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { href: '/auth-mp-secure-2024/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/auth-mp-secure-2024/dashboard/articles', label: 'Articles', icon: Newspaper },
  // { href: '/auth-mp-secure-2024/dashboard/team', label: 'Team Members', icon: Users },
  { href: '/auth-mp-secure-2024/dashboard/pricing', label: 'Pricing Plans', icon: DollarSign },
];

// const settingsNavItems: NavItem[] = [
//   { href: '/auth-mp-secure-2024/dashboard/users', label: 'Users & Roles', icon: Shield },
// ];

const NavLink = ({ item }: { item: NavItem }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/auth-mp-secure-2024/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`
        flex items-center text-sm px-3 py-2.5 rounded-md transition-colors duration-200 group
        ${
          isActive
            ? 'bg-secondary-orange-300/20 text-primary-orange font-semibold'
            : 'text-neutral-dark-gray hover:bg-gray-100'
        }
      `}
    >
      <item.icon className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200 ${isActive ? 'text-primary-orange' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span>{item.label}</span>
    </Link>
  );
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth-mp-secure-2024/me')
      .then(res => {
        if (!res.ok) {
          router.push('/auth-mp-secure-2024/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.user) {
          setAdminUsername(data.user.username);
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth-mp-secure-2024/logout', { method: 'POST' });
    router.push(`/auth-mp-secure-2024/login`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
            <Link href="/auth-mp-secure-2024/dashboard" className="flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#F97316"/>
                    <path d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 28H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-bold text-xl font-urbanist text-neutral-charcoal">MasterPrima</span>
            </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1.5">
            {mainNavItems.map((item) => <NavLink key={item.href} item={item} />)}
            {/* <div className="pt-4 mt-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Settings</p>
                {settingsNavItems.map((item) => <NavLink key={item.href} item={item} />)}
            </div> */}
        </nav>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-gray-100 font-plus-jakarta">
      {/* Desktop Sidebar - Fixed Position */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${!mobileMenuOpen && 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        <div className={`relative w-64 bg-white h-full shadow-xl transition-transform ease-in-out duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </div>
      </div>
      
      {/* Main Content Area with offset for the desktop sidebar */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 sticky top-0 z-10">
           <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600">
                <Menu className="h-6 w-6"/>
            </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <div className="w-9 h-9 rounded-full bg-secondary-orange-300/30 flex items-center justify-center text-primary-orange font-bold">
                        {adminUsername.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">{adminUsername}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isUserMenuOpen && 'rotate-180'}`} />
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-2"/>
                            Logout
                        </button>
                    </div>
                )}
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
