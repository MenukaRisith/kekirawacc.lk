// app/components/admin/AdminLayout.tsx
import { Link, NavLink, Form } from "@remix-run/react";
import type { ReactNode } from "react";
import type { AuthUser } from "~/utils/auth.server";

type AdminLayoutProps = {
  user: AuthUser;
  title?: string;
  children: ReactNode;
};

const navItems = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/news", label: "News" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/clubs", label: "Clubs & Societies" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/alumni", label: "Alumni" },
];

export function AdminLayout({ user, title, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#111827] text-gray-100">
        <div className="h-16 flex items-center px-4 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src="/branding/logo.png"
              alt="KCC Logo"
              className="h-9 w-9 object-contain rounded-md bg-white"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                KCC Admin
              </span>
              <span className="text-[11px] text-gray-400">
                Duty First
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                [
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-[#800000] text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-400">
          <p className="font-medium text-gray-200">{user.fullName}</p>
          <p className="capitalize">{user.role.toLowerCase().replace("_", " ")}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile: menu indicator */}
            <span className="inline-flex md:hidden text-xs text-gray-500">
              Admin Panel
            </span>
            {title && (
              <h1 className="text-base md:text-lg font-semibold text-gray-900">
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-gray-800">
                {user.fullName}
              </span>
              <span className="text-[11px] text-gray-500">
                {user.role}
              </span>
            </div>
            <Form method="post" action="/logout">
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Log out
              </button>
            </Form>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
