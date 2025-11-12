'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DataRow = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

type DataTableProps = {
  data: DataRow[];
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  'In Process': 'secondary',
  Done: 'default',
  Blocked: 'destructive',
};

export function DataTable({ data }: DataTableProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      [row.header, row.type, row.status, row.reviewer].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [data, query]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Workstreams</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor proposal sections, reviewers, and completion status.
          </p>
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sections"
          className="h-9 w-full max-w-sm md:w-56"
        />
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[340px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Section</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Target pages</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead>Reviewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.header}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status] ?? 'outline'}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {row.target}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {row.limit}
                  </TableCell>
                  <TableCell>{row.reviewer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
