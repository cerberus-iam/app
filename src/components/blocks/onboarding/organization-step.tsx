import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Globe, Hash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const organizationSchema = z.object({
  name: z.string().min(2, { message: 'Organization name must be at least 2 characters' }),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters' })
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens',
    }),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationStepProps {
  defaultValues?: Partial<OrganizationFormValues>;
  onNext: (data: OrganizationFormValues) => void;
  onBack?: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Other',
];

const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export function OrganizationStep({ defaultValues, onNext, onBack }: OrganizationStepProps) {
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: defaultValues || {
      name: '',
      slug: '',
      domain: '',
      industry: '',
      size: '',
    },
  });

  // Auto-generate slug from organization name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    form.setValue('slug', slug);
  };

  function onSubmit(data: OrganizationFormValues) {
    onNext(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Acme Inc."
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleNameChange(e.target.value);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>The legal name of your organization</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Slug</FormLabel>
              <FormControl>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input placeholder="acme-inc" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                A unique identifier for your organization (lowercase, alphanumeric, hyphens only)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Domain (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input placeholder="acme.com" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormDescription>Your company website domain</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button type="submit" className={!onBack ? 'ml-auto' : ''}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
