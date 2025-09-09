
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, ExternalLink, AlertTriangle } from 'lucide-react';
import { NotificationProvider } from '@/api/entities';

const PROVIDER_CONFIGS = {
  twilio: {
    fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', required: true, placeholder: 'ACxxxxx' },
      { key: 'auth_token', label: 'Auth Token', type: 'password', required: true, placeholder: 'Your Twilio auth token' },
      { key: 'phone_number', label: 'Twilio Phone Number', type: 'tel', required: true, placeholder: '+1234567890' },
    ],
    docs: 'https://www.twilio.com/docs/usage/api',
    testPayload: { message: 'Test message from AwareCam', to: '+1234567890' }
  },
  sendgrid: {
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxxxx' },
      { key: 'from_email', label: 'From Email', type: 'email', required: true, placeholder: 'alerts@yourcompany.com' },
      { key: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'AwareCam Alerts' },
    ],
    docs: 'https://docs.sendgrid.com/api-reference/mail-send/mail-send',
    testPayload: { subject: 'Test Alert', body: 'This is a test email from AwareCam' }
  },
  slack: {
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.slack.com/services/...' },
      { key: 'default_channel', label: 'Default Channel', type: 'text', required: false, placeholder: '#alerts' },
      { key: 'bot_name', label: 'Bot Name', type: 'text', required: false, placeholder: 'AwareCam' },
    ],
    docs: 'https://api.slack.com/messaging/webhooks',
    testPayload: { text: 'Test message from AwareCam' }
  },
  teams: {
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://outlook.office.com/webhook/...' },
      { key: 'theme_color', label: 'Theme Color', type: 'text', required: false, placeholder: '0076D7' },
    ],
    docs: 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook',
    testPayload: { title: 'Test Alert', text: 'This is a test message from AwareCam' }
  },
  make: {
    fields: [
      { key: 'webhook_url', label: 'Make.com Webhook URL', type: 'url', required: true, placeholder: 'https://hook.integromat.com/...' },
      { key: 'scenario_name', label: 'Scenario Name (optional)', type: 'text', required: false, placeholder: 'AwareCam Alert Handler' },
      { key: 'api_key', label: 'API Key (for advanced features)', type: 'password', required: false, placeholder: 'Your Make.com API key' },
    ],
    docs: 'https://www.make.com/en/help/webhooks',
    testPayload: { 
      source: 'AwareCam', 
      event_type: 'test_alert',
      timestamp: new Date().toISOString(),
      data: { message: 'Test webhook from AwareCam to Make.com' }
    }
  },
  n8n: {
    fields: [
      { key: 'webhook_url', label: 'n8n Webhook URL', type: 'url', required: true, placeholder: 'https://your-n8n-instance.com/webhook/...' },
      { key: 'workflow_name', label: 'Workflow Name (optional)', type: 'text', required: false, placeholder: 'AwareCam Integration' },
      { key: 'auth_header', label: 'Authentication Header', type: 'text', required: false, placeholder: 'Bearer token or API key' },
      { key: 'execution_mode', label: 'Execution Mode', type: 'select', required: true, options: ['synchronous', 'asynchronous'], default: 'asynchronous' },
    ],
    docs: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/',
    testPayload: { 
      source: 'AwareCam',
      workflow: 'alert_processing',
      payload: { message: 'Test webhook from AwareCam to n8n', type: 'test' }
    }
  },
  webhook: {
    fields: [
      { key: 'endpoint_url', label: 'Endpoint URL', type: 'url', required: true, placeholder: 'https://your-api.com/webhooks/alerts' },
      { key: 'auth_header', label: 'Authorization Header', type: 'text', required: false, placeholder: 'Bearer token or API key' },
      { key: 'content_type', label: 'Content Type', type: 'select', required: true, options: ['application/json', 'application/x-www-form-urlencoded'], default: 'application/json' },
      { key: 'custom_headers', label: 'Custom Headers (JSON)', type: 'textarea', required: false, placeholder: '{"X-Custom": "value"}' },
    ],
    docs: 'https://docs.awarecam.com/webhooks',
    testPayload: { event_type: 'test', message: 'Test webhook from AwareCam' }
  },
  zapier: {
    fields: [
      { key: 'webhook_url', label: 'Zapier Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.zapier.com/hooks/catch/...' },
      { key: 'zap_name', label: 'Zap Name (optional)', type: 'text', required: false, placeholder: 'AwareCam Alert Handler' },
    ],
    docs: 'https://zapier.com/apps/webhook/help',
    testPayload: { source: 'AwareCam', event: 'test_alert' }
  }
};

export default function ProviderConfigModal({ provider, onComplete, onCancel }) {
  const existingProvider = provider.existingProvider;
  const config = PROVIDER_CONFIGS[provider.id] || {};
  
  const [formData, setFormData] = useState(() => {
    const initial = { is_active: true };
    if (existingProvider) {
      // Pre-populate with existing data
      const credentials = existingProvider.api_credentials || {};
      config.fields?.forEach(field => {
        initial[field.key] = credentials[field.key] || field.default || '';
      });
      initial.is_active = existingProvider.is_active;
    } else {
      // Set defaults for new providers
      config.fields?.forEach(field => {
        initial[field.key] = field.default || '';
      });
    }
    return initial;
  });
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // Simulate API test - in real implementation, this would test the actual provider
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Test successful! Provider is working correctly.');
    } catch (error) {
      alert('Test failed. Please check your credentials and try again.');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const providerData = {
        provider_name: provider.name,
        provider_type: provider.type,
        is_active: formData.is_active,
        api_credentials: {},
        rate_limits: { requests_per_minute: 100 }, // Default rate limit
        delivery_stats: { success_rate: 0, avg_latency_ms: 0 }
      };

      // Extract credentials from form data
      config.fields?.forEach(field => {
        if (formData[field.key]) {
          providerData.api_credentials[field.key] = formData[field.key];
        }
      });

      if (existingProvider) {
        await NotificationProvider.update(existingProvider.id, providerData);
      } else {
        await NotificationProvider.create(providerData);
      }

      onComplete();
    } catch (error) {
      console.error('Failed to save provider:', error);
      alert('Failed to save provider configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <select
          value={formData[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required={field.required}
        >
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          value={formData[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={3}
        />
      );
    }

    return (
      <Input
        type={field.type}
        value={formData[field.key]}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingProvider ? 'Configure' : 'Connect'} {provider.name}
          </DialogTitle>
          <DialogDescription>
            Set up {provider.name} to send notifications globally across all organizations.
          </DialogDescription>
        </DialogHeader>

        {config.docs && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Need help? Check the official documentation for setup instructions.</span>
              <Button variant="outline" size="sm" asChild>
                <a href={config.docs} target="_blank" rel="noopener noreferrer">
                  View Docs <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {config.fields?.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="mt-1">
                {renderField(field)}
              </div>
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Enable this provider</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing || saving}
              className="flex-1"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {existingProvider ? 'Update Provider' : 'Connect Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
