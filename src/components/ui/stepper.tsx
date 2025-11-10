import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  className,
}: StepperProps) {
  return (
    <nav
      aria-label="Progress"
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-center justify-between'
          : 'flex flex-col space-y-4',
        className,
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;
        const isUpcoming = currentStep < stepNumber;

        return (
          <React.Fragment key={step.title}>
            <div className={cn('flex items-center', orientation === 'vertical' && 'w-full')}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    isUpcoming && 'border-muted-foreground/25 bg-background text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="size-5" /> : <span>{stepNumber}</span>}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isCurrent && 'text-foreground',
                      isCompleted && 'text-foreground',
                      isUpcoming && 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-sm text-muted-foreground">{step.description}</span>
                  )}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  orientation === 'horizontal' ? 'h-[2px] flex-1 mx-4' : 'h-8 w-[2px] ml-5',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/25',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
