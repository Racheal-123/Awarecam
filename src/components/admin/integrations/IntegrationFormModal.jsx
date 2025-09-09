
import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { PlatformIntegration } from '@/api/entities';

const integrationTypes = [
  "slack",
  "teams",
  "webhook",
  "twilio_sms",
  "whatsapp",
  "sendgrid_email",
  "zapier",
  "make",
  "n8n",
  "iot_device"
];

export default function IntegrationFormModal({ integration, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    is_global: false,
    credentials: {
        webhook_url: '',
        api_key: '',
        auth_token: '',
        signing_secret: ''
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (integration) {
      setFormData({
          name: integration.name || '',
          type: integration.type || '',
          description: integration.description || '',
          is_global: integration.is_global || false,
          credentials: {
              webhook_url: integration.credentials?.webhook_url || '',
              api_key: integration.credentials?.api_key || '',
              auth_token: integration.credentials?.auth_token || '',
              signing_secret: integration.credentials?.signing_secret || '',
          }
      });
    }
  }, [integration]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleCredentialChange = (key, value) => {
    setFormData(prev => ({ 
        ...prev, 
        credentials: {
            ...prev.credentials,
            [key]: value
        }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (integration?.id) {
        await PlatformIntegration.update(integration.id, formData);
      } else {
        await PlatformIntegration.create(formData);
      }
      onComplete();
    } catch (error) {
      console.error('Failed to save integration:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const renderCredentialFields = () => {
    switch (formData.type) {
        case 'webhook':
        case 'zapier':
        case 'make':
        case 'n8n':
        case 'slack': // Slack also uses webhooks
            return (
                <div>
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input 
                        id="webhook_url" 
                        value={formData.credentials.webhook_url} 
                        onChange={(e) => handleCredentialChange('webhook_url', e.target.value)} 
                        placeholder={
                            formData.type === 'make' ? 'https://hook.integromat.com/...' :
                            formData.type === 'n8n' ? 'https://your-n8n-instance.com/webhook/...' :
                            'https://your-webhook-endpoint.com/alerts'
                        }
                    />
                </div>
            );
        case 'twilio_sms':
        case 'whatsapp':
        case 'sendgrid_email':
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="api_key">API Key / Account SID</Label>
                        <Input id="api_key" value={formData.credentials.api_key} onChange={(e) => handleCredentialChange('api_key', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="auth_token">Auth Token</Label>
                        <Input id="auth_token" value={formData.credentials.auth_token} onChange={(e) => handleCredentialChange('auth_token', e.target.value)} />
                    </div>
                </div>
             );
        default:
            return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{integration ? 'Edit' : 'Add'} Platform Integration</DialogTitle>
          <DialogDescription>
            Configure a new global integration that can be assigned to organizations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Integration Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Production Webhook" required/>
                </div>
                <div>
                    <Label htmlFor="type">Integration Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {integrationTypes.map(type => (
                                <SelectItem key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="A brief description of this integration's purpose." />
            </div>
            
            <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Credentials & Configuration</h4>
                {renderCredentialFields()}
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="is_global" checked={formData.is_global} onCheckedChange={(value) => handleChange('is_global', value)} />
                <Label htmlFor="is_global">Enable for all new organizations by default</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Integration
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
