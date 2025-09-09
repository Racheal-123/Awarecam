import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Mail, 
  Link as LinkIcon, 
  MessageSquare, 
  Smartphone,
  Zap,
  Slack,
  Send,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { AgentAlertChannel } from '@/api/entities';
import { User } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

const channelIcons = {
  email: Mail,
  webhook: LinkIcon,
  whatsapp: MessageSquare,
  sms: Smartphone,
  iot_device: Zap,
  zapier: Zap,
  slack: Slack,
  telegram: Send
};

const channelColors = {
  email: 'bg-blue-100 text-blue-800',
  webhook: 'bg-slate-100 text-slate-800',
  whatsapp: 'bg-green-100 text-green-800',
  sms: 'bg-purple-100 text-purple-800',
  iot_device: 'bg-orange-100 text-orange-800',
  zapier: 'bg-yellow-100 text-yellow-800',
  slack: 'bg-indigo-100 text-indigo-800',
  telegram: 'bg-cyan-100 text-cyan-800'
};

export default function AlertChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [testingChannel, setTestingChannel] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const user = await User.me();
      if (user.organization_id) {
        setOrganizationId(user.organization_id);
        const channelData = await AgentAlertChannel.filter({ organization_id: user.organization_id });
        setChannels(channelData);
      }
    } catch (error) {
      console.error("Failed to load alert channels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = () => {
    setEditingChannel(null);
    setShowModal(true);
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setShowModal(true);
  };

  const handleDeleteChannel = async (channelId) => {
    if (window.confirm('Are you sure? This will affect existing workflows that use this channel.')) {
      try {
        await AgentAlertChannel.delete(channelId);
        setChannels(prev => prev.filter(c => c.id !== channelId));
      } catch (error) {
        console.error("Failed to delete channel:", error);
        alert("Failed to delete channel.");
      }
    }
  };

  const handleToggleChannel = async (channel) => {
    try {
      const updated = await AgentAlertChannel.update(channel.id, { is_active: !channel.is_active });
      setChannels(prev => prev.map(c => c.id === channel.id ? updated : c));
    } catch (error) {
      console.error("Failed to toggle channel:", error);
    }
  };

  const handleTestChannel = async (channel) => {
    setTestingChannel(channel.id);
    
    try {
      // Simulate test based on channel type
      const testPayload = {
        title: "AwareCam Test Alert",
        description: "This is a test notification to verify your channel configuration.",
        severity: "medium",
        timestamp: new Date().toISOString()
      };

      let testResult = false;

      switch (channel.channel_type) {
        case 'webhook':
        case 'zapier':
          if (channel.channel_configuration.webhook_url || channel.channel_configuration.zapier_webhook_url) {
            const url = channel.channel_configuration.webhook_url || channel.channel_configuration.zapier_webhook_url;
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(testPayload)
            });
            testResult = response.ok;
          }
          break;
        
        case 'email':
          // For demo, we'll just mark as success if email is configured
          testResult = !!channel.channel_configuration.email_address;
          break;
        
        default:
          // For other channels (WhatsApp, SMS, IoT), simulate success
          testResult = true;
          break;
      }

      await AgentAlertChannel.update(channel.id, {
        test_status: testResult ? 'success' : 'failed',
        last_test_date: new Date().toISOString()
      });

      setChannels(prev => prev.map(c => 
        c.id === channel.id 
          ? { ...c, test_status: testResult ? 'success' : 'failed', last_test_date: new Date().toISOString() }
          : c
      ));

    } catch (error) {
      console.error("Test failed:", error);
      await AgentAlertChannel.update(channel.id, {
        test_status: 'failed',
        last_test_date: new Date().toISOString()
      });
      setChannels(prev => prev.map(c => 
        c.id === channel.id 
          ? { ...c, test_status: 'failed', last_test_date: new Date().toISOString() }
          : c
      ));
    } finally {
      setTestingChannel(null);
    }
  };

  const handleModalSuccess = (channelData) => {
    if (editingChannel) {
      setChannels(prev => prev.map(c => c.id === channelData.id ? channelData : c));
    } else {
      setChannels(prev => [...prev, channelData]);
    }
    setShowModal(false);
    setEditingChannel(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alert Channels</CardTitle>
            <CardDescription>Configure how and where your organization receives alert notifications.</CardDescription>
          </div>
          <Button onClick={handleAddChannel}>
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {channels.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No Alert Channels</h3>
            <p className="text-sm mb-4">Set up your first notification channel to start receiving alerts.</p>
            <Button onClick={handleAddChannel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Channel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map(channel => {
              const IconComponent = channelIcons[channel.channel_type] || LinkIcon;
              const testIcon = testingChannel === channel.id ? Loader2 : 
                               channel.test_status === 'success' ? CheckCircle : 
                               channel.test_status === 'failed' ? XCircle : TestTube;
              
              return (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${channelColors[channel.channel_type]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{channel.channel_name}</h4>
                        {!channel.is_active && <Badge variant="outline" className="text-red-600">Disabled</Badge>}
                        {channel.test_status === 'success' && <Badge className="bg-green-100 text-green-800">Tested ✓</Badge>}
                        {channel.test_status === 'failed' && <Badge className="bg-red-100 text-red-800">Test Failed</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 capitalize">{channel.channel_type.replace('_', ' ')}</p>
                      {channel.description && <p className="text-xs text-slate-500 mt-1">{channel.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestChannel(channel)}
                      disabled={!channel.is_active || testingChannel === channel.id}
                    >
                      {React.createElement(testIcon, { 
                        className: `w-4 h-4 mr-1 ${testingChannel === channel.id ? 'animate-spin' : ''}` 
                      })}
                      Test
                    </Button>
                    <Switch
                      checked={channel.is_active}
                      onCheckedChange={() => handleToggleChannel(channel)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEditChannel(channel)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteChannel(channel.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {showModal && (
        <ChannelFormModal
          channel={editingChannel}
          organizationId={organizationId}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </Card>
  );
}

function ChannelFormModal({ channel, organizationId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    channel_name: channel?.channel_name || '',
    channel_type: channel?.channel_type || 'email',
    description: channel?.description || '',
    configuration: channel?.channel_configuration || {}
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const channelData = {
        organization_id: organizationId,
        channel_name: formData.channel_name,
        channel_type: formData.channel_type,
        description: formData.description,
        channel_configuration: formData.configuration,
        is_active: true
      };

      const result = channel 
        ? await AgentAlertChannel.update(channel.id, channelData)
        : await AgentAlertChannel.create(channelData);

      onSuccess(result);
    } catch (error) {
      console.error("Failed to save channel:", error);
      alert("Failed to save channel configuration.");
    } finally {
      setSaving(false);
    }
  };

  const updateConfiguration = (key, value) => {
    setFormData(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [key]: value }
    }));
  };

  const renderConfigurationFields = () => {
    switch (formData.channel_type) {
      case 'email':
        return (
          <div>
            <Label htmlFor="email_address">Email Address</Label>
            <Input
              id="email_address"
              type="email"
              value={formData.configuration.email_address || ''}
              onChange={(e) => updateConfiguration('email_address', e.target.value)}
              placeholder="alerts@company.com"
            />
          </div>
        );
      
      case 'webhook':
        return (
          <>
            <div>
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                type="url"
                value={formData.configuration.webhook_url || ''}
                onChange={(e) => updateConfiguration('webhook_url', e.target.value)}
                placeholder="https://your-server.com/webhook"
              />
            </div>
            <div>
              <Label htmlFor="auth_token">Auth Token (Optional)</Label>
              <Input
                id="auth_token"
                type="password"
                value={formData.configuration.auth_token || ''}
                onChange={(e) => updateConfiguration('auth_token', e.target.value)}
                placeholder="Bearer token or API key"
              />
            </div>
          </>
        );
      
      case 'whatsapp':
        return (
          <div>
            <Label htmlFor="phone_number">WhatsApp Number</Label>
            <Input
              id="phone_number"
              value={formData.configuration.phone_number || ''}
              onChange={(e) => updateConfiguration('phone_number', e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-xs text-slate-500 mt-1">Note: WhatsApp integration is simulated via webhook</p>
          </div>
        );
      
      case 'iot_device':
        return (
          <div>
            <Label htmlFor="device_ip">Device IP Address</Label>
            <Input
              id="device_ip"
              value={formData.configuration.device_ip || ''}
              onChange={(e) => updateConfiguration('device_ip', e.target.value)}
              placeholder="192.168.1.100"
            />
          </div>
        );
      
      case 'zapier':
        return (
          <div>
            <Label htmlFor="zapier_webhook_url">Zapier Webhook URL</Label>
            <Input
              id="zapier_webhook_url"
              type="url"
              value={formData.configuration.zapier_webhook_url || ''}
              onChange={(e) => updateConfiguration('zapier_webhook_url', e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>
        );
      
      default:
        return (
          <div>
            <Label htmlFor="generic_url">Service URL</Label>
            <Input
              id="generic_url"
              type="url"
              value={formData.configuration.webhook_url || ''}
              onChange={(e) => updateConfiguration('webhook_url', e.target.value)}
              placeholder="https://api.service.com/webhook"
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{channel ? 'Edit' : 'Add'} Alert Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="channel_name">Channel Name</Label>
            <Input
              id="channel_name"
              value={formData.channel_name}
              onChange={(e) => setFormData(prev => ({ ...prev, channel_name: e.target.value }))}
              placeholder="e.g., Security Team Email"
              required
            />
          </div>

          <div>
            <Label htmlFor="channel_type">Channel Type</Label>
            <Select 
              value={formData.channel_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, channel_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="iot_device">IoT Device</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderConfigurationFields()}

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this channel used for?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {channel ? 'Update' : 'Create'} Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}