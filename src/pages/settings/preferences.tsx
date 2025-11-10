import { type ReactElement } from 'react';
import { Save } from 'lucide-react';

import type { NextPageWithLayout } from '@/types/page';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const PreferencesPage: NextPageWithLayout = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>
            Decide how you would like to be notified about critical IAM events. Persistence to the
            backend will be implemented in a future milestone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium leading-none">High severity alerts</p>
              <p className="text-sm text-muted-foreground">
                Receive email and in-app notifications for P0 incidents.
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium leading-none">Weekly summaries</p>
              <p className="text-sm text-muted-foreground">
                Stay informed with a digest of key IAM metrics.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

PreferencesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Admin Preferences"
      description="Configure your personal experience and notification rules."
      breadcrumbs={[{ label: 'Organization', href: '/iam/tenants' }, { label: 'Settings' }]}
      actions={
        <Button className="gap-2">
          <Save className="size-4" />
          Save changes
        </Button>
      }
    >
      {page}
    </AppLayout>
  );
};

export default PreferencesPage;
