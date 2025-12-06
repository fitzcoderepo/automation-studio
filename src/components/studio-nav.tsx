"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


type StudioNavProps = React.PropsWithChildren<{}>;

export default function StudioNav({ children }: StudioNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/automations", label: "Automations" },
    { href: "/chatbot", label: "AI Chatbot" },
    { href: "/conversations", label: "Conversations" },
    { href: "/files", label: "Files" },
    { href: "/users", label: "Users" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-6">Automation Studio</h2>

        <nav className="flex flex-col gap-3">
          {navItems.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? "text-white font-medium bg-slate-800 rounded px-3 py-2"
                    : "text-slate-400 hover:text-white rounded px-3 py-2"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}