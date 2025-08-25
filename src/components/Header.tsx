'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Menu,
  Settings,
  ChevronDown,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const isAdmin = (user as any)?.role === 'ADMIN';
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Generate page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1 && segments[0] === 'dashboard')
      return 'Dashboard';
    if (segments.includes('admin')) {
      if (segments.includes('certifications')) return 'Manage Certifications';
      if (segments.includes('users')) return 'Manage Users';
      return 'Admin Panel';
    }
    return (
      segments[segments.length - 1]
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Dashboard'
    );
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
      <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {getPageTitle()}
            </h1>
            {pathname !== '/dashboard' && (
              <div className="hidden sm:flex items-center text-sm text-slate-500">
                <span className="mx-2">•</span>
                <span className="capitalize">
                  {pathname.split('/').slice(1, -1).join(' • ')}
                </span>
              </div>
            )}
          </div>
          {/* <div className="hidden sm:block text-xs text-slate-500 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div> */}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-x-3">
          {/* Search */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors">
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs text-slate-400 bg-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* User Info */}
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-semibold text-slate-900 max-w-32 truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {isAdmin && <Shield className="h-3 w-3" />}
                    <span className="capitalize">
                      {(user as any)?.role?.toLowerCase() || 'User'}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {user?.name || 'User'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {user?.email || 'user@example.com'}
                      </div>
                      {isAdmin && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    View Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default Header;
