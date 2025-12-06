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
      <aside className="w-64 nav-surface p-6">
        <h2 className="text-xl font-bold mb-6 text-white">Automation Studio</h2>

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
                className={`rounded px-3 py-2 nav-link ${
                  isActive ? "nav-link-active font-medium" : ""
                }`}
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
