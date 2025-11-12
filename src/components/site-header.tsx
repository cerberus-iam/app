'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Bell, LifeBuoy, LogOut, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/http';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function SiteHeader() {
  const { user, logout } = useAuth();

  const initials = useMemo(() => {
    return (
      user?.name
        ?.split(' ')
        .map((segment) => segment.slice(0, 1))
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'AD'
    );
  }, [user?.name]);

  return (
    <header className="flex h-(--header-height) items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <Input
          placeholder="Search users, roles, policies"
          className="hidden h-9 max-w-sm lg:block"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="hidden size-9 md:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="size-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden flex-col text-left text-sm font-medium sm:flex">
                {user?.name ?? user?.email ?? 'Admin'}
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.organisation?.name ?? 'Cerberus IAM'}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <DropdownMenuItem disabled>{user?.email ?? 'admin@cerberus.dev'}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <Settings2 className="size-4" />
                Account settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex items-center gap-2">
                <LifeBuoy className="size-4" />
                Help & support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async (event) => {
                event.preventDefault();
                try {
                  await logout();
                  toast.success('Signed out');
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to sign out'));
                }
              }}
              className="flex items-center gap-2 text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
