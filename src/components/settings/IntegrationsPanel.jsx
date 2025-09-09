import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Settings as SettingsIcon, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { PlatformIntegration } from '@/api/entities';
import { AgentAlertChannel } from '@/api/entities';
import { useUser } from '@/pages/Layout';

import IntegrationConnectionModal from '@/components/settings/IntegrationConnectionModal';
import WebhookConfigModal from '@/components/settings/WebhookConfigModal';
import TestIntegrationModal from '@/components/settings/TestIntegrationModal';

const integrationIcons = {
  slack: '💬',
  teams: '🟦',
  webhook: '🔗', 
  twilio_sms: '📱',
  whatsapp: '📱',
  sendgrid_email: '✉️',
  zapier: '⚡',
  n8n: '🔄',
  iot_device: '🔌'
};

const integrationDescriptions = {
  slack: 'Send alerts directly to your Slack channels and receive interactive notifications.',
  teams: 'Integrate with Microsoft Teams for seamless collaboration and alert management.',
  webhook: 'Custom HTTP endpoints for advanced integrations with your existing systems.',
  twilio_sms: 'Send SMS alerts to team members for critical incidents.',
  whatsapp: 'WhatsApp Business integration for instant mobile notifications.',
  sendgrid_email: 'Professional email notifications with customizable templates.',
  zapier: 'Connect to 5000+ apps through Zapier automation workflows.',
  n8n: 'Open-source workflow automation for complex integrations.',
  iot_device: 'Trigger IoT devices like sirens, lights, or locks based on alerts.'
};

export default function IntegrationsPanel() {
  const { organization, userRole } = useUser();
  const [platformIntegrations, setPlatformIntegrations] = useState([]);
  const [orgIntegrations, setOrgIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [testingChannels, setTestingChannels] = useState(new Set());

  const isOrgAdmin = userRole?.role_name === 'organization_admin';

  useEffect(() => {
    if (organization) {
      loadIntegrations();
    }
  }, [organization]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const [platformData, orgChannels] = await Promise.all([
        PlatformIntegration.filter({ status: 'active' }),
        AgentAlertChannel.filter({ organization_id: organization.id })
      ]);

      // Filter platform integrations that this org is allowed to use
      const allowedIntegrations = platformData.filter(integration => 
        integration.is_global || 
        (organization.enabled_platform_integrations && 
         organization.enabled_platform_integrations.includes(integration.id))
      );

      setPlatformIntegrations(allowedIntegrations);
      setOrgIntegrations(orgChannels);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectIntegration = (integration) => {
    setSelectedIntegration(integration);
    if (integration.type === 'webhook') {
      setShowWebhookModal(true);
    } else {
      setShowConnectionModal(true);
    }
  };

  const handleEditChannel = (channel) => {
    setSelectedChannel(channel);
    const platformIntegration = platformIntegrations.find(p => p.type === channel.channel_type);
    setSelectedIntegration(platformIntegration);
    
    if (channel.channel_type === 'webhook') {
      setShowWebhookModal(true);
    } else {
      setShowConnectionModal(true);
    }
  };

  const handleTestChannel = async (channel) => {
    setSelectedChannel(channel);
    setShowTestModal(true);
  };

  const handleDeleteChannel = async (channelId) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    
    try {
      await AgentAlertChannel.delete(channelId);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const handleConnectionComplete = () => {
    setShowConnectionModal(false);
    setShowWebhookModal(false);
    setSelectedIntegration(null);
    setSelectedChannel(null);
    loadIntegrations();
  };

  const handleTestComplete = () => {
    setShowTestModal(false);
    setSelectedChannel(null);
    loadIntegrations();
  };

  const getConnectionStatus = (integrationType) => {
    const connections = orgIntegrations.filter(channel => channel.channel_type === integrationType);
    if (connections.length === 0) return { status: 'not_connected', count: 0 };
    
    const activeConnections = connections.filter(c => c.is_active);
    if (activeConnections.length === 0) return { status: 'inactive', count: connections.length };
    
    return { status: 'connected', count: activeConnections.length };
  };

  const renderIntegrationCard = (integration) => {
    const connectionStatus = getConnectionStatus(integration.type);
    const connections = orgIntegrations.filter(c => c.channel_type === integration.type);

    return (
      <Card key={integration.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{integrationIcons[integration.type]}</div>
              <div>
                <CardTitle className="text-base">{integration.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {integrationDescriptions[integration.type]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus.status === 'connected' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected ({connectionStatus.count})
                </Badge>
              )}
              {connectionStatus.status === 'inactive' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Inactive ({connectionStatus.count})
                </Badge>
              )}
              {connectionStatus.status === 'not_connected' && (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Existing Connections */}
          {connections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700">Your Connections:</h4>
              {connections.map(channel => (
                <div key={channel.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${channel.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                    <span className="text-sm font-medium">{channel.channel_name}</span>
                    {channel.test_status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {channel.test_status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTestChannel(channel)}
                      disabled={testingChannels.has(channel.id)}
                    >
                      {testingChannels.has(channel.id) ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                    </Button>
                    {isOrgAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditChannel(channel)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChannel(channel.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Connect Button */}
          {isOrgAdmin && (
            <Button 
              onClick={() => handleConnectIntegration(integration)}
              variant={connectionStatus.status === 'not_connected' ? 'default' : 'outline'}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {connectionStatus.status === 'not_connected' ? 'Connect' : 'Add Another'}
            </Button>
          )}

          {/* Help Link */}
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-slate-600">
              <ExternalLink className="w-4 h-4 mr-2" />
              Setup Guide & Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-slate-500">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Available Integrations</h3>
          <p className="text-sm text-slate-600">
            Connect your organization's tools and services to receive alerts and notifications.
          </p>
        </div>
        {!isOrgAdmin && (
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Only organization administrators can manage integrations.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="messaging" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="custom">Custom/API</TabsTrigger>
          <TabsTrigger value="iot">IoT Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="messaging" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformIntegrations
              .filter(i => ['slack', 'teams', 'twilio_sms', 'whatsapp', 'sendgrid_email'].includes(i.type))
              .map(renderIntegrationCard)}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformIntegrations
              .filter(i => ['zapier', 'n8n'].includes(i.type))
              .map(renderIntegrationCard)}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformIntegrations
              .filter(i => i.type === 'webhook')
              .map(renderIntegrationCard)}
          </div>
        </TabsContent>

        <TabsContent value="iot" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformIntegrations
              .filter(i => i.type === 'iot_device')
              .map(renderIntegrationCard)}
          </div>
        </TabsContent>
      </Tabs>

      {platformIntegrations.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <SettingsIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Integrations Available</h3>
            <p className="text-slate-500">
              Contact your platform administrator to enable integrations for your organization.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showConnectionModal && selectedIntegration && (
        <IntegrationConnectionModal
          integration={selectedIntegration}
          existingChannel={selectedChannel}
          onComplete={handleConnectionComplete}
          onCancel={() => {
            setShowConnectionModal(false);
            setSelectedIntegration(null);
            setSelectedChannel(null);
          }}
        />
      )}

      {showWebhookModal && selectedIntegration && (
        <WebhookConfigModal
          integration={selectedIntegration}
          existingChannel={selectedChannel}
          onComplete={handleConnectionComplete}
          onCancel={() => {
            setShowWebhookModal(false);
            setSelectedIntegration(null);
            setSelectedChannel(null);
          }}
        />
      )}

      {showTestModal && selectedChannel && (
        <TestIntegrationModal
          channel={selectedChannel}
          onComplete={handleTestComplete}
          onCancel={() => {
            setShowTestModal(false);
            setSelectedChannel(null);
          }}
        />
      )}
    </div>
  );
}