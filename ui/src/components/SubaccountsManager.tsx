import { useState } from "react";
import { Button } from "./Button";
import { Plus, Users, Key, Settings, MoreVertical } from "lucide-react";
import { DataCard } from "./DataCard";

const subaccounts = [
  {
    id: "sa_001",
    name: "Trading Desk Alpha",
    permissions: ["trade", "view", "transfer"],
    equity: 1250000,
    margin: 125000,
    positions: 12,
    users: ["trader_01", "trader_02"],
  },
  {
    id: "sa_002",
    name: "Market Making",
    permissions: ["trade", "view"],
    equity: 875000,
    margin: 87500,
    positions: 8,
    users: ["mm_01"],
  },
  {
    id: "sa_003",
    name: "Research & Analytics",
    permissions: ["view"],
    equity: 0,
    margin: 0,
    positions: 0,
    users: ["analyst_01", "analyst_02", "analyst_03"],
  },
];

const roles = [
  {
    role: "Admin",
    users: 2,
    permissions: ["All permissions"],
  },
  {
    role: "Trader",
    users: 3,
    permissions: ["Trade", "View positions", "Modify orders"],
  },
  {
    role: "Analyst",
    users: 3,
    permissions: ["View positions", "Export data"],
  },
  {
    role: "Viewer",
    users: 5,
    permissions: ["View positions"],
  },
];

export function SubaccountsManager() {
  const [activeTab, setActiveTab] = useState<"accounts" | "roles">("accounts");

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold" style={{ fontSize: "1.5rem" }}>
              Subaccounts & Permissions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage delegated trading accounts and role-based access controls
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Subaccount
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <DataCard label="Total Subaccounts" value="3" icon={<Users className="h-5 w-5" />} />
          <DataCard label="Active Users" value="13" icon={<Key className="h-5 w-5" />} />
          <DataCard
            label="Total Equity"
            value="$2.13M"
            change="+8.2% today"
            changeType="positive"
          />
          <DataCard label="Active Positions" value="20" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setActiveTab("accounts")}
            className={
              activeTab === "accounts"
                ? "flex-1 rounded-md bg-background px-4 py-2 font-medium shadow-sm"
                : "flex-1 rounded-md px-4 py-2 text-muted-foreground hover:text-foreground"
            }
          >
            Subaccounts
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={
              activeTab === "roles"
                ? "flex-1 rounded-md bg-background px-4 py-2 font-medium shadow-sm"
                : "flex-1 rounded-md px-4 py-2 text-muted-foreground hover:text-foreground"
            }
          >
            Roles & Permissions
          </button>
        </div>

        {/* Content */}
        {activeTab === "accounts" ? (
          <div className="space-y-4">
            {subaccounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg border border-border bg-card p-6 transition-all hover:border-ultramarine-300"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold" style={{ fontSize: "1.125rem" }}>
                      {account.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">ID: {account.id}</p>
                  </div>
                  <button className="rounded p-2 hover:bg-accent">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="mb-4 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Equity</p>
                    <p className="mt-1 font-mono font-semibold">
                      ${account.equity.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margin Used</p>
                    <p className="mt-1 font-mono font-semibold">
                      ${account.margin.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Positions</p>
                    <p className="mt-1 font-semibold">{account.positions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p className="mt-1 font-semibold">{account.users.length}</p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {account.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-full bg-ultramarine-100 px-3 py-1 text-xs font-medium text-ultramarine-700 dark:bg-ultramarine-900/30 dark:text-ultramarine-300"
                    >
                      {perm}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {account.users.map((user, i) => (
                      <div
                        key={i}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-ultramarine-100 dark:bg-ultramarine-900/30"
                      >
                        <span className="text-xs font-medium text-ultramarine-700 dark:text-ultramarine-300">
                          {user.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline">
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                      Users
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                      Permissions
                    </th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ultramarine-100 dark:bg-ultramarine-900/30">
                            <Key className="h-5 w-5 text-ultramarine-600 dark:text-ultramarine-400" />
                          </div>
                          <span className="font-medium">{role.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono">{role.users} users</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((perm, j) => (
                            <span
                              key={j}
                              className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
