import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useIamRoles } from '@/hooks/use-iam-data';
import { getApiErrorMessage } from '@/lib/http';
import { iamApi } from '@/lib/iam/api';
import type { NextPageWithLayout } from '@/types/page';

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  sendInvitation: z.boolean(),
  roleIds: z.array(z.string()).optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const NewUserPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: roles, isLoading: rolesLoading } = useIamRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      sendInvitation: false,
      roleIds: [],
    },
  });

  const sendInvitation = useWatch({ control: form.control, name: 'sendInvitation' }) ?? false;
  const password = useWatch({ control: form.control, name: 'password' }) ?? '';

  const passwordStrength = (() => {
    if (!password) return null;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', bar: 'w-1/3 bg-red-500' } as const;
    if (strength <= 4) return { label: 'Medium', bar: 'w-2/3 bg-yellow-500' } as const;
    return { label: 'Strong', bar: 'w-full bg-green-500' } as const;
  })();

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.sendInvitation ? undefined : data.password,
        roleIds: data.roleIds,
      };

      const newUser = await iamApi.admin.users.create(payload);
      toast.success('User created');
      router.push(`/iam/users/${newUser.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create user'));
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/iam/users');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" onClick={handleBack} className="w-fit">
          <ArrowLeft className="mr-2 size-4" />
          Back to users
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create user</h1>
          <p className="text-sm text-muted-foreground">
            Provision an account manually or send an invitation to set credentials.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Collect the information needed to create the user.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Lovelace" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ada.lovelace@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sendInvitation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Send invitation email</FormLabel>
                        <FormDescription>
                          The invitee will receive a secure token to set their password and verify
                          their account.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!sendInvitation && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Set an initial password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                              onClick={() => setShowPassword((value) => !value)}
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {passwordStrength && (
                          <div className="space-y-1">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <span className={`block h-full ${passwordStrength.bar}`} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Password strength: {passwordStrength.label}
                            </p>
                          </div>
                        )}
                        <FormDescription>
                          Must include 8+ characters with upper, lower, and numeric symbols.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    <UserPlus className="mr-2 size-4" />
                    {isSubmitting ? 'Creating…' : 'Create user'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign roles</CardTitle>
            <CardDescription>Select the permissions granted upon creation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rolesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : roles && roles.length > 0 ? (
              <FormField
                control={form.control}
                name="roleIds"
                render={({ field }) => (
                  <div className="space-y-2">
                    {roles.map((role) => {
                      const checked = field.value?.includes(role.id) ?? false;
                      return (
                        <label
                          key={role.id}
                          className="flex items-start gap-3 rounded-lg border p-3"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const selected = new Set(field.value ?? []);
                              if (value) {
                                selected.add(role.id);
                              } else {
                                selected.delete(role.id);
                              }
                              field.onChange(Array.from(selected));
                            }}
                          />
                          <span className="space-y-1">
                            <span className="block text-sm font-medium">{role.name}</span>
                            {role.description ? (
                              <span className="block text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            ) : null}
                          </span>
                          {role.isDefault ? (
                            <Badge variant="outline" className="ml-auto">
                              Default
                            </Badge>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No roles available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

NewUserPage.getLayout = (page) => (
  <AppLayout
    title="Users"
    description="Manage user accounts and permissions"
    breadcrumbs={[{ label: 'IAM' }, { label: 'Users', href: '/iam/users' }, { label: 'New user' }]}
  >
    {page}
  </AppLayout>
);

export default NewUserPage;
