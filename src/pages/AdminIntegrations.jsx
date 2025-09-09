import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlugZap, Waypoints, BarChart, Construction } from 'lucide-react';

import IntegrationsDirectory from '@/components/admin/integrations/IntegrationsDirectory';
import ChannelProviders from '@/components/admin/integrations/ChannelProviders';

export default function AdminIntegrationsPage() {
  const [activeTab, setActiveTab] = useState('integrations');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <PlugZap className="w-8 h-8 text-blue-600" />
          Platform Integrations
        </h1>
        <p className="text-slate-600 mt-1">
          Manage global integrations, notification channels, and API providers for the entire platform.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <PlugZap className="w-4 h-4" />
            Integrations Directory
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Waypoints className="w-4 h-4" />
            Channel Providers
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Usage & Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Global Integrations</CardTitle>
              <CardDescription>
                Configure third-party integrations that can be enabled for organizations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationsDirectory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channel Providers</CardTitle>
              <CardDescription>
                Configure global notification providers like Twilio, SendGrid, and webhook services that organizations can use for their alert channels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChannelProviders />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring">
          <Card>
            <CardContent className="p-8 text-center">
              <Construction className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800">Coming Soon</h3>
              <p className="text-slate-600 mt-2">
                This section will provide detailed analytics on integration usage and health across the platform.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}