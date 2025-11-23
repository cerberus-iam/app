'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { getProblemMessage } from '@/lib/api/error-utils';
import type { Role } from '@/lib/api/roles';
import { RolesApi } from '@/lib/api/roles';
import { UsersApi } from '@/lib/api/users';
import type { User } from '@/types/iam';

interface ManageUserRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const usersApi = new UsersApi(apiClient);
const rolesApi = new RolesApi(apiClient);

export function ManageUserRolesDialog({
  user,
  open,
  onOpenChange,
}: ManageUserRolesDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set()
  );
  const [initialRoleIds, setInitialRoleIds] = useState<Set<string>>(new Set());

  // Load available roles when dialog opens
  useEffect(() => {
    if (open && user) {
      loadRoles();
      // Initialize selected roles from user
      const userRoleIds = new Set(user.roles.map((r) => r.id));
      setSelectedRoleIds(userRoleIds);
      setInitialRoleIds(userRoleIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const result = await rolesApi.list({ limit: 100 });
      if (result.ok) {
        setAvailableRoles(result.value.data);
      } else {
        toast.error('Failed to load roles', {
          description: getProblemMessage(result.error),
        });
      }
    } catch (error) {
      toast.error('Failed to load roles', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!user) return;

      setIsSubmitting(true);

      try {
        // Determine which roles to add and remove
        const rolesToAdd = Array.from(selectedRoleIds).filter(
          (id) => !initialRoleIds.has(id)
        );
        const rolesToRemove = Array.from(initialRoleIds).filter(
          (id) => !selectedRoleIds.has(id)
        );

        // Remove roles first
        if (rolesToRemove.length > 0) {
          const removeResult = await usersApi.removeRoles(user.id, {
            roleIds: rolesToRemove,
          });
          if (!removeResult.ok) {
            toast.error('Failed to remove roles', {
              description: getProblemMessage(removeResult.error),
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Then add new roles
        if (rolesToAdd.length > 0) {
          const assignResult = await usersApi.assignRoles(user.id, {
            roleIds: rolesToAdd,
          });
          if (!assignResult.ok) {
            toast.error('Failed to assign roles', {
              description: getProblemMessage(assignResult.error),
            });
            setIsSubmitting(false);
            return;
          }
        }

        toast.success('User roles updated', {
          description: `Successfully updated roles for ${user.email}`,
        });

        onOpenChange(false);
        router.replace(router.asPath);
      } catch (error) {
        toast.error('Failed to update roles', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, selectedRoleIds, initialRoleIds, onOpenChange, router]
  );

  const hasChanges =
    selectedRoleIds.size !== initialRoleIds.size ||
    Array.from(selectedRoleIds).some((id) => !initialRoleIds.has(id));

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Assign or remove roles for{' '}
              <span className="font-medium">{user.email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-h-[300px] space-y-4 overflow-y-auto pr-4">
                <div className="space-y-4">
                  {availableRoles.length === 0 ? (
                    <p className="text-muted-foreground text-center text-sm">
                      No roles available
                    </p>
                  ) : (
                    availableRoles.map((role) => (
                      <div key={role.id}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={selectedRoleIds.has(role.id)}
                            onCheckedChange={() => handleToggleRole(role.id)}
                          />
                          <div className="flex-1 space-y-1">
                            <label
                              htmlFor={`role-${role.id}`}
                              className="flex items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {role.name}
                              {role.isSystemRole && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </label>
                            {role.description && (
                              <p className="text-muted-foreground text-sm">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {role.id !==
                          availableRoles[availableRoles.length - 1].id && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
