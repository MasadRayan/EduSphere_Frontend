"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from "@/lib/admin/actions";
import type { AdminUserRow } from "@/types/entities";
import { ROLES } from "@/types/enums";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

export function UserStatusButton({
  user,
  viewerId,
}: {
  user: AdminUserRow;
  viewerId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const blocking = user.status !== "BLOCKED";

  const onConfirm = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", user.id);
      formData.set("status", blocking ? "BLOCKED" : "ACTIVE");
      const result = await updateUserStatusAction(undefined, formData);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };

  const selfBlock = user.id === viewerId && blocking;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={selfBlock || user.status === "DELETED"}
        title={selfBlock ? "You cannot block your own account" : undefined}
        onClick={() => setOpen(true)}
      >
        {blocking ? "Block" : "Unblock"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={blocking ? `Block ${user.name}?` : `Unblock ${user.name}?`}
        description={
          blocking
            ? "A blocked user is logged out and cannot sign in until unblocked."
            : "The user will be able to sign in again."
        }
        confirmLabel={blocking ? "Block user" : "Unblock user"}
        destructive={blocking}
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}

export function UserRoleDialog({
  user,
  viewerId,
  viewerIsSuperAdmin,
}: {
  user: AdminUserRow;
  viewerId: string;
  viewerIsSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>(user.role);
  const [pending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", user.id);
      formData.set("role", role);
      const result = await updateUserRoleAction(undefined, formData);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };

  const noChange = role === user.role;
  const selfChange = user.id === viewerId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!viewerIsSuperAdmin || selfChange}
          title={
            !viewerIsSuperAdmin
              ? "Only a super admin can change roles"
              : selfChange
                ? "You cannot change your own role"
                : undefined
          }
        >
          Change role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change role for {user.name}</DialogTitle>
          <DialogDescription>
            The new role applies at the next sign in. A user cannot change their
            own role, and the last super admin cannot be demoted.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger aria-label="Role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((option) => (
                <SelectItem key={option} value={option}>
                  {ROLE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={pending || noChange}
          >
            {pending ? "Saving..." : "Save role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteUserButton({
  user,
  viewerIsSuperAdmin,
}: {
  user: AdminUserRow;
  viewerIsSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };

  const targetIsSuper = user.role === "SUPER_ADMIN";
  const disabled = viewerIsSuperAdmin ? false : targetIsSuper;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || user.status === "DELETED"}
        title={
          disabled ? "Only a super admin can delete a super admin" : undefined
        }
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${user.name}'s account?`}
        description="This is a soft delete: the account is marked deleted and can no longer sign in."
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
