import { useRouter } from 'next/router';
import { CheckCircle2, Building2, User, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { OnboardingData } from '@/types/auth';

interface CompletionStepProps {
  data: OnboardingData;
  onBack?: () => void;
}

export function CompletionStep({ data, onBack }: CompletionStepProps) {
  const router = useRouter();

  const handleComplete = () => {
    // TODO: Navigate to dashboard or login
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="size-10 text-green-600 dark:text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Organization Created Successfully!</h2>
          <p className="text-muted-foreground">
            Your organization and admin account have been set up.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="size-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Organization Details</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Name:</span> {data.organization.name}
                  </p>
                  <p>
                    <span className="font-medium">Slug:</span> {data.organization.slug}
                  </p>
                  {data.organization.domain && (
                    <p>
                      <span className="font-medium">Domain:</span> {data.organization.domain}
                    </p>
                  )}
                  {data.organization.industry && (
                    <p>
                      <span className="font-medium">Industry:</span> {data.organization.industry}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <User className="size-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Admin Account</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Name:</span> {data.admin.firstName}{' '}
                    {data.admin.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {data.admin.email}
                  </p>
                  <p className="text-xs italic">
                    A verification email has been sent to this address
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Next Steps</h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Verify your email address to activate your account</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Sign in to your admin dashboard</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Configure your organization settings</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Invite team members and set up roles</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={handleComplete} className={!onBack ? 'ml-auto' : ''}>
          Go to Login
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
