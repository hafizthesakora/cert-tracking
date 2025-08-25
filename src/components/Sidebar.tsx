'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Shield,
  Users,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ user }: { user: any }) => {
  const pathname = usePathname();
  const isAdmin = user?.role === 'ADMIN';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    // Add more navigation items here if needed
  ];

  const adminNavigation = [
    {
      name: 'Manage Certs',
      href: '/dashboard/admin/certifications',
      icon: Shield,
    },
    { name: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 pb-4 shadow-2xl border-r border-slate-700/50">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center text-white border-b border-slate-700/30 pb-4 mt-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Cert-Tracker
          </span>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Main Navigation */}
            <li>
              <ul role="list" className="-mx-2 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-r-2 border-blue-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border-r-2 border-transparent hover:border-slate-600',
                          'group flex items-center gap-x-3 rounded-lg p-3 text-sm font-semibold transition-all duration-200 ease-in-out transform hover:translate-x-1'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            isActive
                              ? 'text-blue-200'
                              : 'text-slate-400 group-hover:text-slate-200',
                            'h-5 w-5 shrink-0 transition-colors duration-200'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                        {isActive && (
                          <ChevronRight className="ml-auto h-4 w-4 text-blue-200" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Admin Section */}
            {isAdmin && (
              <li>
                <div className="flex items-center gap-2 text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wider mb-3">
                  <div className="h-px bg-slate-700 flex-1"></div>
                  <span className="px-2">Admin Panel</span>
                  <div className="h-px bg-slate-700 flex-1"></div>
                </div>
                <ul role="list" className="-mx-2 space-y-2">
                  {adminNavigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            isActive
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg border-r-2 border-amber-400'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border-r-2 border-transparent hover:border-slate-600',
                            'group flex items-center gap-x-3 rounded-lg p-3 text-sm font-semibold transition-all duration-200 ease-in-out transform hover:translate-x-1'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              isActive
                                ? 'text-amber-200'
                                : 'text-slate-400 group-hover:text-slate-200',
                              'h-5 w-5 shrink-0 transition-colors duration-200'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                          {isActive && (
                            <ChevronRight className="ml-auto h-4 w-4 text-amber-200" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}

            {/* User Info & Sign Out */}
            <li className="mt-auto border-t border-slate-700/30 pt-4">
              {/* User Profile Section */}
              <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-300 border border-amber-700/30">
                      Admin
                    </span>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full group flex items-center gap-x-3 rounded-lg p-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-red-900/20 hover:border-red-500/30 border-2 border-transparent transition-all duration-200 ease-in-out"
              >
                <LogOut
                  className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-400 transition-colors duration-200"
                  aria-hidden="true"
                />
                Sign out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
