import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AgentAlertChannel } from '@/api/entities';
import { useUser } from '@/pages/Layout';

const channelTypes = [
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'webhook', label: 'Webhook', icon: '🔗' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'iot_device', label: 'IoT Device', icon: '🔌' },
  { value: 'zapier', label: 'Zapier', icon: '⚡' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'telegram', label: 'Telegram', icon: '📨' }
];

export default function ChannelForm({ channel, onComplete, onCancel }) {
  const { organization } = useUser();
  const [formData, setFormData] = useState({
    channel_name: channel?.channel_name || '',
    channel_type: channel?.channel_type || '',
    description: channel?.description || '',
    is_active: channel?.is_active ?? true,
    channel_configuration: channel?.channel_configuration || {}
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const channelData = {
        ...formData,
        organization_id: organization.id
      };

      if (channel?.id) {
        await AgentAlertChannel.update(channel.id, channelData);
      } else {
        await AgentAlertChannel.create(channelData);
      }
      
      onComplete();
    } catch (error) {
      console.error('Failed to save channel:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfiguration = (key, value) => {
    setFormData(prev => ({
      ...prev,
      channel_configuration: {
        ...prev.channel_configuration,
        [key]: value
      }
    }));
  };

  const renderConfigurationFields = () => {
    switch (formData.channel_type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                type="email"
                value={formData.channel_configuration.email_address || ''}
                onChange={(e) => updateConfiguration('email_address', e.target.value)}
                placeholder="alerts@company.com"
              />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                type="url"
                value={formData.channel_configuration.webhook_url || ''}
                onChange={(e) => updateConfiguration('webhook_url', e.target.value)}
                placeholder="https://your-server.com/webhook"
              />
            </div>
            <div>
              <Label htmlFor="auth_token">Authorization Token (Optional)</Label>
              <Input
                id="auth_token"
                type="password"
                value={formData.channel_configuration.auth_token || ''}
                onChange={(e) => updateConfiguration('auth_token', e.target.value)}
                placeholder="Bearer token or API key"
              />
            </div>
          </div>
        );
      
      case 'whatsapp':
      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.channel_configuration.phone_number || ''}
                onChange={(e) => updateConfiguration('phone_number', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.channel_configuration.api_key || ''}
                onChange={(e) => updateConfiguration('api_key', e.target.value)}
                placeholder="Your messaging service API key"
              />
            </div>
          </div>
        );
      
      case 'iot_device':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="device_ip">Device IP Address</Label>
              <Input
                id="device_ip"
                value={formData.channel_configuration.device_ip || ''}
                onChange={(e) => updateConfiguration('device_ip', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="device_port">Port (Optional)</Label>
              <Input
                id="device_port"
                type="number"
                value={formData.channel_configuration.device_port || ''}
                onChange={(e) => updateConfiguration('device_port', e.target.value)}
                placeholder="8080"
              />
            </div>
          </div>
        );
      
      case 'zapier':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="zapier_webhook_url">Zapier Webhook URL</Label>
              <Input
                id="zapier_webhook_url"
                type="url"
                value={formData.channel_configuration.zapier_webhook_url || ''}
                onChange={(e) => updateConfiguration('zapier_webhook_url', e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />
            </div>
          </div>
        );
      
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
              <Input
                id="slack_webhook"
                type="url"
                value={formData.channel_configuration.webhook_url || ''}
                onChange={(e) => updateConfiguration('webhook_url', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          </div>
        );
      
      case 'telegram':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bot_token">Bot Token</Label>
              <Input
                id="bot_token"
                type="password"
                value={formData.channel_configuration.auth_token || ''}
                onChange={(e) => updateConfiguration('auth_token', e.target.value)}
                placeholder="Your Telegram bot token"
              />
            </div>
            <div>
              <Label htmlFor="chat_id">Chat ID</Label>
              <Input
                id="chat_id"
                value={formData.channel_configuration.chat_id || ''}
                onChange={(e) => updateConfiguration('chat_id', e.target.value)}
                placeholder="Telegram chat ID"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-slate-500 text-center py-4">
            Please select a channel type to configure
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {channel ? 'Edit Alert Channel' : 'Create Alert Channel'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channel_name">Channel Name</Label>
              <Input
                id="channel_name"
                value={formData.channel_name}
                onChange={(e) => setFormData(prev => ({ ...prev, channel_name: e.target.value }))}
                placeholder="Safety Team Alerts"
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
                  <SelectValue placeholder="Select channel type" />
                </SelectTrigger>
                <SelectContent>
                  {channelTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this channel is used for..."
              rows={3}
            />
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-4">Channel Configuration</h4>
            {renderConfigurationFields()}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Channel is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : (channel ? 'Update Channel' : 'Create Channel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}