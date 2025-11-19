import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client"; // prisma auto generates a type for models
import DashboardShell from "@/components/dashboard-shell";



export default async function UsersPage() {

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });


  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="rounded-lg border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Email</th>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.name ?? "—"}</td>
                <td className="px-4 py-2">
                  {user.createdAt.toLocaleString
                    ? user.createdAt.toLocaleString()
                    : new Date(user.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </DashboardShell>


  );
}