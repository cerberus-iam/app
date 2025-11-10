import { useState } from 'react';
import Link from 'next/link';
import { Building2, ChevronLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import {
  OrganizationStep,
  type OrganizationFormValues,
} from '@/components/blocks/onboarding/organization-step';
import {
  AdminUserStep,
  type AdminUserFormValues,
} from '@/components/blocks/onboarding/admin-user-step';
import { CompletionStep } from '@/components/blocks/onboarding/completion-step';
import type { OnboardingData } from '@/types/auth';
import { toast } from 'sonner';

const steps = [
  {
    title: 'Organization',
    description: 'Set up your organization',
  },
  {
    title: 'Admin Account',
    description: 'Create your admin user',
  },
  {
    title: 'Complete',
    description: 'Review and finish',
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    organization: undefined,
    admin: undefined,
  });

  const handleOrganizationNext = (data: OrganizationFormValues) => {
    setOnboardingData((prev) => ({
      ...prev,
      organization: data,
    }));
    setCurrentStep(2);
  };

  const handleAdminUserNext = async (data: AdminUserFormValues) => {
    setIsSubmitting(true);

    try {
      const completeData: OnboardingData = {
        organization: onboardingData.organization!,
        admin: data,
      };

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Onboarding data:', completeData);

      setOnboardingData(completeData);
      setCurrentStep(3);

      toast.success('Organization created successfully!', {
        description: 'Your organization and admin account have been set up.',
      });
    } catch {
      toast.error('Failed to create organization', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to login
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Your Organization</h1>
          <p className="mt-2 text-muted-foreground">
            Set up your organization and create your admin account
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} orientation="horizontal" />
        </div>

        {/* Form Content */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <OrganizationStep
                defaultValues={onboardingData.organization}
                onNext={handleOrganizationNext}
              />
            )}

            {currentStep === 2 && (
              <AdminUserStep
                defaultValues={onboardingData.admin}
                organizationName={onboardingData.organization?.name}
                onNext={handleAdminUserNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && onboardingData.organization && onboardingData.admin && (
              <CompletionStep data={onboardingData as OnboardingData} onBack={handleBack} />
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By creating an organization, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
