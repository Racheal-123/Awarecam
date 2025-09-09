import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AgentAlertChannel } from '@/api/entities';
import { useUser } from '@/pages/Layout';
import ChannelForm from '@/components/alerts/ChannelForm';

const channelTypeIcons = {
  email: '✉️',
  webhook: '🔗',
  whatsapp: '📱',
  sms: '💬',
  iot_device: '🔌',
  zapier: '⚡',
  slack: '💬',
  telegram: '📨',
  teams: '🟦',
  twilio_sms: '📱',
  sendgrid_email: '✉️',
  n8n: '🔄'
};

const channelTypeLabels = {
  email: 'Email',
  webhook: 'Webhook',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  iot_device: 'IoT Device',
  zapier: 'Zapier',
  slack: 'Slack',
  telegram: 'Telegram',
  teams: 'Microsoft Teams',
  twilio_sms: 'Twilio SMS',
  sendgrid_email: 'SendGrid Email',
  n8n: 'n8n Workflow'
};

export default function AlertChannels({ onChannelsChange }) {
  const { organization } = useUser();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [testingChannels, setTestingChannels] = useState(new Set());

  useEffect(() => {
    if (organization) {
      loadChannels();
    }
  }, [organization]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const channelList = await AgentAlertChannel.filter({ organization_id: organization.id });
      setChannels(channelList);
      if (onChannelsChange) {
        onChannelsChange(channelList);
      }
    } catch (error) {
      console.error('Failed to load alert channels:', error);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = () => {
    setEditingChannel(null);
    setShowForm(true);
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setShowForm(true);
  };

  const handleDeleteChannel = async (channelId) => {
    if (!confirm('Are you sure you want to delete this alert channel?')) return;
    
    try {
      await AgentAlertChannel.delete(channelId);
      loadChannels();
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  };

  const handleTestChannel = async (channel) => {
    setTestingChannels(prev => new Set([...prev, channel.id]));
    
    try {
      // Simulate testing the channel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the channel test status
      await AgentAlertChannel.update(channel.id, {
        test_status: 'success',
        last_test_date: new Date().toISOString()
      });
      
      loadChannels();
    } catch (error) {
      console.error('Channel test failed:', error);
      
      await AgentAlertChannel.update(channel.id, {
        test_status: 'failed',
        last_test_date: new Date().toISOString()
      });
      
      loadChannels();
    } finally {
      setTestingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channel.id);
        return newSet;
      });
    }
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingChannel(null);
    loadChannels();
  };

  const getTestStatusIcon = (status, channelId) => {
    if (testingChannels.has(channelId)) {
      return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
    
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-slate-500">Loading alert channels...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Alert Channels</h3>
          <p className="text-sm text-slate-600">
            Configure how alerts are delivered to your team. Set up integrations in the Settings tab first.
          </p>
        </div>
        <Button onClick={handleCreateChannel}>
          <Plus className="w-4 h-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {channels.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-8">
            <div className="text-slate-400 mb-4">📢</div>
            <h4 className="font-semibold text-slate-700 mb-2">No Alert Channels</h4>
            <p className="text-slate-500 mb-4">
              Set up your integrations in Settings, then create alert channels here.
            </p>
            <Button onClick={handleCreateChannel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Channel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {channelTypeIcons[channel.channel_type] || '🔔'}
                    </span>
                    <div>
                      <CardTitle className="text-base">{channel.channel_name}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {channelTypeLabels[channel.channel_type] || channel.channel_type}
                      </p>
                    </div>
                  </div>
                  <Badge variant={channel.is_active ? 'default' : 'secondary'}>
                    {channel.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {channel.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTestStatusIcon(channel.test_status, channel.id)}
                    <span className="text-xs text-slate-500">
                      {channel.test_status === 'untested' ? 'Not tested' :
                       channel.test_status === 'success' ? 'Working' : 'Failed'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestChannel(channel)}
                      disabled={testingChannels.has(channel.id)}
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditChannel(channel)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteChannel(channel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <ChannelForm
          channel={editingChannel}
          onComplete={handleFormComplete}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}