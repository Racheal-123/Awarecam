import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

import AlertLogViewer from '@/components/admin/alerts/AlertLogViewer';

export default function AdminAlertMonitoring() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            Global Alert Monitoring
          </h1>
          <p className="text-slate-600 mt-1">Monitor notification delivery status across all organizations.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
            <AlertLogViewer />
        </CardContent>
      </Card>
    </div>
  );
}