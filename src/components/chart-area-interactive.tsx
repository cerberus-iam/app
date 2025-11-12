'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const series = [
  { name: 'Jan', active: 520, invited: 180 },
  { name: 'Feb', active: 640, invited: 220 },
  { name: 'Mar', active: 780, invited: 260 },
  { name: 'Apr', active: 860, invited: 320 },
  { name: 'May', active: 910, invited: 340 },
  { name: 'Jun', active: 980, invited: 360 },
];

export function ChartAreaInteractive() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">Active members</h3>
        <p className="text-sm text-muted-foreground">
          Track the growth of verified accounts compared to new invitations.
        </p>
      </div>
      <div className="mt-6 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="fill-none stroke-border" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                borderRadius: '0.75rem',
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active users"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="invited"
              name="Invitations"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
