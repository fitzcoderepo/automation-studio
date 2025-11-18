import React from 'react';
import Link from "next/link";

type DashboardShellProps = React.PropsWithChildren<{}>;

export default function DashboardShell({ children }: DashboardShellProps) {
    return (
       <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-6">Automation Studio</h2>

        <nav className="flex flex-col gap-3">
          <Link href="/users" className="text-slate-400 hover:text-white">
            Users
          </Link>

          <Link href="/chatbot" className="text-slate-400 hover:text-white">
            AI Chatbot
          </Link>

          <Link href="/automation" className="text-slate-400 hover:text-white">
            Automations
          </Link>

          <Link href="/inventory" className="text-slate-400 hover:text-white">
            Inventory
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}