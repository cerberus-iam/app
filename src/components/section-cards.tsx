import { ShieldCheck, UsersRound, KeySquare, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const metrics = [
  {
    title: 'Total members',
    value: '1,248',
    description: 'Verified accounts across your tenant',
    icon: UsersRound,
  },
  {
    title: 'Roles in use',
    value: '18',
    description: 'Active permission templates',
    icon: ShieldCheck,
  },
  {
    title: 'API keys',
    value: '42',
    description: 'Issued across service clients',
    icon: KeySquare,
  },
  {
    title: 'Monthly audits',
    value: '9,441',
    description: 'Events captured in the last 30 days',
    icon: Activity,
  },
];

export function SectionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ title, value, description, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <CardDescription>{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
