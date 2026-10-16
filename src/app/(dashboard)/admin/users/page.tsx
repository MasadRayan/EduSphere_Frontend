import { ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import {
  DeleteUserButton,
  UserRoleDialog,
  UserStatusButton,
} from "@/components/admin/user-actions";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableSearch } from "@/components/shared/table-search";
import { Badge } from "@/components/ui/badge";
import { listUsers } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { readPage } from "@/lib/search-params";
import type { AdminUserRow } from "@/types/entities";
import { ROLES, USER_STATUSES } from "@/types/enums";

export const metadata: Metadata = { title: "Users" };

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  DELETED: "Deleted",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const read = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const role = read("role");
  const status = read("status");
  const searchTerm = read("searchTerm");
  const page = readPage(params.page);

  const [session, users] = await Promise.all([
    getSession(),
    listUsers({ role, status, searchTerm, page, limit: 10 }),
  ]);
  const viewerId = session?.id ?? "";
  const viewerIsSuperAdmin = session?.role === "SUPER_ADMIN";

  const columns: DataTableColumn<AdminUserRow>[] = [
    {
      id: "user",
      header: "User",
      cell: (user) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {user.name}
            {user.id === viewerId ? (
              <span className="ml-2 text-xs text-muted-foreground">(you)</span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {ROLE_LABELS[user.role] ?? user.role}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <StatusBadge status={user.status} />,
    },
    {
      id: "auth",
      header: "Auth",
      cell: (user) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p>
            {user.emailVerified ? "Verified" : "Not verified"} -{" "}
            {user.authProvider.toLowerCase()}
          </p>
          <p className="font-mono">Joined {formatDate(user.createdAt)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (user) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <UserStatusButton user={user} viewerId={viewerId} />
          <UserRoleDialog
            user={user}
            viewerId={viewerId}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
          />
          <DeleteUserButton
            user={user}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="All accounts across roles. Block, unblock, soft delete or change roles. Role changes are limited to super admins."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Results"
          value={users.meta.total}
          hint={`Page ${users.meta.page} of ${Math.max(users.meta.totalPages, 1)}`}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Blocked"
          value={users.data.filter((user) => user.status === "BLOCKED").length}
          hint="On this page"
          icon={ShieldCheck}
          tone="warning"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TableSearch placeholder="Search name or email" className="sm:w-64" />
        <TableFilter
          paramKey="role"
          label="Filter by role"
          allLabel="All roles"
          options={ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))}
        />
        <TableFilter
          paramKey="status"
          label="Filter by status"
          allLabel="All statuses"
          options={USER_STATUSES.map((value) => ({
            value,
            label: STATUS_LABELS[value],
          }))}
        />
      </div>

      {users.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No accounts match these filters. Try clearing the search or filters."
        />
      ) : (
        <DataTable
          columns={columns}
          data={users.data}
          getRowKey={(user) => user.id}
        />
      )}

      <TablePagination
        page={users.meta.page}
        totalPages={users.meta.totalPages}
        total={users.meta.total}
      />
    </div>
  );
}
