import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { MeProfile } from "@/types/iam";

interface SiteHeaderProps {
  user: MeProfile;
}

const resolveDisplayName = (user: MeProfile): string => {
  const parts = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((value) => value?.trim());
  const joined = parts.filter(Boolean).join(" ");

  if (joined) {
    return joined;
  }

  if (user.name && user.name.trim()) {
    return user.name.trim();
  }

  return user.email;
};

const resolveInitials = (user: MeProfile): string => {
  const name = resolveDisplayName(user);
  const matches = name.match(/\b\w/g);
  if (!matches || matches.length === 0) {
    return user.email.slice(0, 2).toUpperCase();
  }

  const initials = `${matches[0] ?? ""}${matches[1] ?? ""}`.toUpperCase();
  return initials;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  const displayName = resolveDisplayName(user);
  const subtitle = user.organisation?.name ?? user.organisation?.slug ?? "";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col gap-0.5 text-sm">
          <h1 className="text-base font-medium">{subtitle || "Dashboard"}</h1>
          <span className="text-muted-foreground text-xs">
            Welcome back, {displayName}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{displayName}</p>
            <p className="text-muted-foreground text-xs leading-tight">
              {user.email}
            </p>
          </div>
          <Avatar>
            <AvatarFallback>{resolveInitials(user)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
