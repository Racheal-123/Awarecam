import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Link as LinkIcon, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { AgentAlertChannel } from '@/api/entities';
import { useUser } from '@/pages/Layout';

export default function WebhookConfigModal({ integration, existingChannel, onComplete, onCancel }) {
  const { organization } = useUser();
  const [formData, setFormData] = useState(() => {
    if (existingChannel) {
      return {
        channel_name: existingChannel.channel_name,
        webhook_url: existingChannel.channel_configuration.webhook_url || '',
        http_method: existingChannel.channel_configuration.http_method || 'POST',
        auth_header: existingChannel.channel_configuration.auth_header || '',
        custom_headers: existingChannel.channel_configuration.custom_headers ? 
          JSON.stringify(existingChannel.channel_configuration.custom_headers, null, 2) : '',
        payload_template: existingChannel.channel_configuration.payload_template || ''
      };
    }
    return {
      channel_name: `Webhook - ${organization?.name || 'Org'}`,
      http_method: 'POST',
      custom_headers: '{\n  "Content-Type": "application/json"\n}',
      payload_template: '{\n  "alert_type": "{event_type}",\n  "location": "{camera_name}",\n  "timestamp": "{timestamp}",\n  "severity": "{severity}",\n  "description": "{description}"\n}'
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Parse custom headers
      let customHeaders = {};
      if (formData.custom_headers) {
        try {
          customHeaders = JSON.parse(formData.custom_headers);
        } catch (parseError) {
          setError('Invalid JSON format in custom headers');
          setSaving(false);
          return;
        }
      }

      const channelConfig = {
        webhook_url: formData.webhook_url,
        http_method: formData.http_method,
        auth_header: formData.auth_header,
        custom_headers: customHeaders,
        payload_template: formData.payload_template
      };

      const channelData = {
        organization_id: organization.id,
        channel_name: formData.channel_name,
        channel_type: 'webhook',
        channel_configuration: channelConfig,
        description: 'Custom webhook integration',
        is_active: true
      };

      if (existingChannel) {
        await AgentAlertChannel.update(existingChannel.id, channelData);
      } else {
        await AgentAlertChannel.create(channelData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (error) {
      console.error('Failed to save webhook:', error);
      setError(`Failed to ${existingChannel ? 'update' : 'create'} webhook. Please check your settings and try again.`);
    } finally {
      setSaving(false);
    }
  };

  const copyExamplePayload = () => {
    const examplePayload = `{
  "alert_type": "{event_type}",
  "camera_name": "{camera_name}",
  "zone_name": "{zone_name}",
  "timestamp": "{timestamp}",
  "severity": "{severity}",
  "confidence": "{confidence}",
  "description": "{description}",
  "organization": "${organization?.name || '{organization_name}'}",
  "event_id": "{event_id}",
  "thumbnail_url": "{thumbnail_url}",
  "video_url": "{video_url}"
}`;
    setFormData(prev => ({ ...prev, payload_template: examplePayload }));
  };

  if (showSuccess) {
    return (
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-lg font-semibold">Webhook Configured!</h3>
            <p className="text-sm text-slate-600">
              Your webhook has been {existingChannel ? 'updated' : 'configured'} successfully.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Webhook</DialogTitle>
          <DialogDescription>
            Set up a custom webhook to receive alert notifications from your events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <LinkIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Webhook Events:</strong> Your endpoint will receive HTTP requests when alerts are triggered. 
              Configure the URL, headers, and payload format below.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Webhook Name */}
              <div>
                <Label htmlFor="channel_name">Webhook Name</Label>
                <Input
                  id="channel_name"
                  value={formData.channel_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, channel_name: e.target.value }))}
                  placeholder="Production API Webhook"
                  required
                />
              </div>

              {/* HTTP Method */}
              <div>
                <Label htmlFor="http_method">HTTP Method</Label>
                <Select
                  value={formData.http_method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, http_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Webhook URL */}
            <div>
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                type="url"
                value={formData.webhook_url}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://api.yourservice.com/webhooks/alerts"
                required
              />
            </div>

            {/* Authorization Header */}
            <div>
              <Label htmlFor="auth_header">Authorization Header (Optional)</Label>
              <Input
                id="auth_header"
                type="password"
                value={formData.auth_header}
                onChange={(e) => setFormData(prev => ({ ...prev, auth_header: e.target.value }))}
                placeholder="Bearer your-api-token"
              />
            </div>

            {/* Custom Headers */}
            <div>
              <Label htmlFor="custom_headers">Custom Headers (JSON)</Label>
              <Textarea
                id="custom_headers"
                value={formData.custom_headers}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_headers: e.target.value }))}
                className="font-mono text-sm"
                rows={4}
                placeholder={'{\n  "Content-Type": "application/json",\n  "X-API-Key": "your-key"\n}'}
              />
            </div>

            {/* Payload Template */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="payload_template">Payload Template (JSON)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyExamplePayload}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Use Example
                </Button>
              </div>
              <Textarea
                id="payload_template"
                value={formData.payload_template}
                onChange={(e) => setFormData(prev => ({ ...prev, payload_template: e.target.value }))}
                className="font-mono text-sm"
                rows={8}
                placeholder="Leave empty to use default payload format"
              />
            </div>

            {/* Variable Reference */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Available Variables:</strong> Use these placeholders in your payload template:
                <br />
                <code className="text-xs bg-slate-100 px-1 rounded">
                  {'{event_type}'}, {'{camera_name}'}, {'{zone_name}'}, {'{timestamp}'}, {'{severity}'}, {'{confidence}'}, {'{description}'}, {'{event_id}'}, {'{thumbnail_url}'}, {'{video_url}'}
                </code>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {existingChannel ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    {existingChannel ? 'Update Webhook' : 'Save Webhook'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}