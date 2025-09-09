import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeadphonesIcon } from 'lucide-react';

import SupportDashboard from '@/components/admin/support/SupportDashboard';
import TicketQueue from '@/components/admin/support/TicketQueue';

export default function AdminSupportPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <HeadphonesIcon className="w-8 h-8 text-blue-600" />
            Admin Support Center
          </h1>
          <p className="text-slate-600 mt-1">Manage customer support tickets, monitor agent performance, and resolve issues.</p>
        </div>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="queue">Ticket Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <SupportDashboard />
        </TabsContent>
        <TabsContent value="queue" className="mt-6">
          <TicketQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}