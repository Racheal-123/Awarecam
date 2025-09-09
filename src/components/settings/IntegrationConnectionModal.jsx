import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { AgentAlertChannel } from '@/api/entities';
import { useUser } from '@/pages/Layout';

const integrationSetupSteps = {
  slack: {
    title: 'Connect Slack Workspace',
    description: 'Send alerts directly to your Slack channels',
    steps: [
      'Go to your Slack workspace settings',
      'Navigate to "Apps" and search for "Incoming Webhooks"',
      'Click "Add to Slack" and select your channel',
      'Copy the webhook URL and paste it below'
    ],
    fields: [
      { name: 'webhook_url', label: 'Slack Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'channel_name', label: 'Slack Channel', type: 'text', required: true, placeholder: '#alerts' }
    ]
  },
  teams: {
    title: 'Connect Microsoft Teams',
    description: 'Send alerts to your Teams channels',
    steps: [
      'Open your Teams channel',
      'Click "..." next to the channel name',
      'Select "Connectors"',
      'Find "Incoming Webhook" and configure it',
      'Copy the webhook URL'
    ],
    fields: [
      { name: 'webhook_url', label: 'Teams Webhook URL', type: 'url', required: true, placeholder: 'https://outlook.office.com/webhook/...' },
      { name: 'channel_name', label: 'Teams Channel', type: 'text', required: true, placeholder: 'Safety Alerts' }
    ]
  },
  twilio_sms: {
    title: 'Connect Twilio SMS',
    description: 'Send SMS alerts via Twilio',
    steps: [
      'Log in to your Twilio Console',
      'Find your Account SID and Auth Token',
      'Get your Twilio phone number',
      'Enter the details below'
    ],
    fields: [
      { name: 'account_sid', label: 'Account SID', type: 'text', required: true, placeholder: 'ACxxxxxxxxxxxxxxxxxxxxx' },
      { name: 'auth_token', label: 'Auth Token', type: 'password', required: true, placeholder: 'Your auth token' },
      { name: 'phone_number', label: 'Twilio Phone Number', type: 'tel', required: true, placeholder: '+1234567890' },
      { name: 'recipient_numbers', label: 'Recipient Numbers (comma-separated)', type: 'text', required: true, placeholder: '+1987654321, +1555555555' }
    ]
  },
  whatsapp: {
    title: 'Connect WhatsApp Business',
    description: 'Send alerts via WhatsApp Business API',
    steps: [
      'Set up WhatsApp Business API account',
      'Get your access token from Facebook Developer Console',
      'Verify your phone number ID',
      'Enter your credentials below'
    ],
    fields: [
      { name: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: 'Your WhatsApp access token' },
      { name: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true, placeholder: '1234567890123456' },
      { name: 'recipient_numbers', label: 'Recipient Numbers (comma-separated)', type: 'text', required: true, placeholder: '+1987654321, +1555555555' }
    ]
  },
  sendgrid_email: {
    title: 'Connect SendGrid Email',
    description: 'Send professional email alerts',
    steps: [
      'Log in to your SendGrid account',
      'Go to Settings > API Keys',
      'Create a new API key with Mail Send permissions',
      'Copy the API key'
    ],
    fields: [
      { name: 'api_key', label: 'SendGrid API Key', type: 'password', required: true, placeholder: 'SG.xxxxxxxxxxxxxxxxxx' },
      { name: 'from_email', label: 'From Email Address', type: 'email', required: true, placeholder: 'alerts@yourcompany.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Security Alerts' },
      { name: 'recipient_emails', label: 'Recipient Emails (comma-separated)', type: 'text', required: true, placeholder: 'manager@company.com, security@company.com' }
    ]
  },
  zapier: {
    title: 'Connect Zapier',
    description: 'Trigger Zapier workflows from alerts',
    steps: [
      'Log in to your Zapier account',
      'Create a new Zap with "Webhooks by Zapier" as trigger',
      'Choose "Catch Hook" and copy the webhook URL',
      'Set up your desired actions in the Zap'
    ],
    fields: [
      { name: 'webhook_url', label: 'Zapier Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.zapier.com/hooks/catch/...' }
    ]
  },
  n8n: {
    title: 'Connect n8n Workflow',
    description: 'Trigger n8n workflows from alerts',
    steps: [
      'Open your n8n instance',
      'Create a workflow with a Webhook node',
      'Set the webhook to listen for POST requests',
      'Copy the webhook URL'
    ],
    fields: [
      { name: 'webhook_url', label: 'n8n Webhook URL', type: 'url', required: true, placeholder: 'https://your-n8n.com/webhook/...' },
      { name: 'auth_header', label: 'Authorization Header (optional)', type: 'password', required: false, placeholder: 'Bearer your-token' }
    ]
  }
};

export default function IntegrationConnectionModal({ integration, existingChannel, onComplete, onCancel }) {
  const { organization } = useUser();
  const [formData, setFormData] = useState(() => {
    if (existingChannel) {
      return {
        channel_name: existingChannel.channel_name,
        ...existingChannel.channel_configuration
      };
    }
    return {
      channel_name: `${integration.name} - ${organization?.name || 'Org'}`
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const config = integrationSetupSteps[integration.type];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Prepare the channel configuration
      const channelConfig = {};
      config.fields.forEach(field => {
        if (formData[field.name]) {
          channelConfig[field.name] = formData[field.name];
        }
      });

      const channelData = {
        organization_id: organization.id,
        channel_name: formData.channel_name,
        channel_type: integration.type,
        channel_configuration: channelConfig,
        description: `${integration.name} integration`,
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
      console.error('Failed to save integration:', error);
      setError(`Failed to ${existingChannel ? 'update' : 'create'} integration. Please check your settings and try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  if (showSuccess) {
    return (
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-lg font-semibold">Integration Connected!</h3>
            <p className="text-sm text-slate-600">
              Your {integration.name} integration has been {existingChannel ? 'updated' : 'connected'} successfully.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Setup Steps */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Setup Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              {config.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Channel Name */}
            <div>
              <Label htmlFor="channel_name">Connection Name</Label>
              <Input
                id="channel_name"
                value={formData.channel_name}
                onChange={(e) => handleFieldChange('channel_name', e.target.value)}
                placeholder="Give this connection a name"
                required
              />
            </div>

            {/* Dynamic Fields */}
            {config.fields.map(field => (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            ))}

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
                    {existingChannel ? 'Updating...' : 'Connecting...'}
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    {existingChannel ? 'Update Connection' : 'Connect Integration'}
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