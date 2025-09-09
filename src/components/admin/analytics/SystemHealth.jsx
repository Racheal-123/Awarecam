import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function SystemHealth() {
  // This data would come from a monitoring service. For now, it's mocked.
  const healthData = {
    uptime: '99.98%',
    apiLatency: '120ms',
    databaseConnections: 45,
    recentErrors: 3,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Real-time platform status (mocked data).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Uptime (24h)</span>
          </div>
          <span className="font-bold">{healthData.uptime}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="font-medium">API Latency (avg)</span>
          </div>
          <span className="font-bold">{healthData.apiLatency}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-medium">Recent Errors (1h)</span>
          </div>
          <span className="font-bold">{healthData.recentErrors}</span>
        </div>
      </CardContent>
    </Card>
  );
}