import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Bell, Settings, TestTube } from 'lucide-react';
import { Organization } from '@/api/entities';
import { useUser } from '@/layout';

import AlertChannels from '@/components/alerts/AlertChannels';
import AlertWorkflows from '@/components/alerts/AlertWorkflows';
import NotificationLogs from '@/components/alerts/NotificationLogs';
import TestAlertEngine from '@/components/alerts/TestAlertEngine';
import WorkflowBuilder from '@/components/alerts/WorkflowBuilder';
import { AnimatePresence } from 'framer-motion';

export default function AlertSettingsPage() {
  const { user, organization } = useUser();
  const [activeTab, setActiveTab] = useState('workflows');
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [channels, setChannels] = useState([]);
  
  useEffect(() => {
    if (!organization?.workflow_addon_enabled) {
      setActiveTab('channels'); // Default to basic channels if no workflow addon
    }
  }, [organization]);

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setShowWorkflowBuilder(true);
  };

  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setShowWorkflowBuilder(true);
  };

  const handleWorkflowSaved = () => {
    setShowWorkflowBuilder(false);
    setEditingWorkflow(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Alert & Notification Settings
          </h1>
          <p className="text-slate-600 mt-1">
            Configure how and when you receive notifications for events and anomalies.
          </p>
        </div>
        {organization?.workflow_addon_enabled && (
          <Button onClick={handleCreateWorkflow} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {organization?.workflow_addon_enabled && (
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Smart Flows
            </TabsTrigger>
          )}
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alert Channels
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Delivery Logs
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Test & Debug
          </TabsTrigger>
        </TabsList>

        {organization?.workflow_addon_enabled && (
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Alert Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertWorkflows 
                  onEdit={handleEditWorkflow}
                  channels={channels}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertChannels onChannelsChange={setChannels} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationLogs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Alert System</CardTitle>
            </CardHeader>
            <CardContent>
              <TestAlertEngine channels={channels} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {showWorkflowBuilder && (
          <WorkflowBuilder
            workflow={editingWorkflow}
            channels={channels}
            onSave={handleWorkflowSaved}
            onCancel={() => setShowWorkflowBuilder(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}