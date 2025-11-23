'use client';

import {
  IconDots,
  IconMail,
  IconMailCheck,
  IconShieldCheck,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/iam';

interface ColumnContext {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onManageRoles: (user: User) => void;
}

// Helper function to get user initials
const getInitials = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.name) {
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
};

// Helper function to get display name
const getDisplayName = (user: User): string => {
  if (user.name) return user.name;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  return user.email.split('@')[0];
};

export const createColumns = (context: ColumnContext): ColumnDef<User>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'user',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const displayName = getDisplayName(user);
      const initials = getInitials(user);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{displayName}</span>
              {user.emailVerifiedAt ? (
                <IconMailCheck className="size-3.5 text-green-600" />
              ) : (
                <IconMail className="text-muted-foreground size-3.5" />
              )}
            </div>
            <span className="text-muted-foreground text-sm">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'roles',
    accessorFn: (row) => row.roles.map((r) => r.name).join(', '),
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.original.roles;
      if (roles.length === 0)
        return <span className="text-muted-foreground">No roles</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {roles.slice(0, 2).map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
          ))}
          {roles.length > 2 && (
            <Badge variant="outline">+{roles.length - 2}</Badge>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'status',
    accessorFn: (row) => (row.blockedAt ? 'blocked' : 'active'),
    header: 'Status',
    cell: ({ row }) => {
      const user = row.original;
      const isBlocked = !!user.blockedAt;
      return (
        <Badge
          variant={isBlocked ? 'destructive' : 'outline'}
          className={
            isBlocked
              ? ''
              : 'border-green-600 text-green-700 dark:text-green-400'
          }
        >
          {isBlocked ? 'Blocked' : 'Active'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'mfa',
    accessorKey: 'mfaEnabled',
    header: 'MFA',
    cell: ({ row }) => {
      const mfaEnabled = row.original.mfaEnabled;
      return mfaEnabled ? (
        <Badge variant="outline" className="gap-1">
          <IconShieldCheck className="size-3" />
          Enabled
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <IconDots className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => context.onEdit(user)}>
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => context.onManageRoles(user)}>
              Manage roles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.blockedAt ? (
              <DropdownMenuItem>Unblock user</DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-destructive">
                Block user
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => context.onDelete(user)}
            >
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
