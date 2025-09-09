
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Zap,
  Webhook,
  Bot,
  Workflow, // Added Workflow icon
  GitBranch // Added GitBranch icon
} from 'lucide-react';
import { NotificationProvider } from '@/api/entities';
import ProviderConfigModal from '@/components/admin/integrations/ProviderConfigModal';

const AVAILABLE_PROVIDERS = [
  {
    id: 'twilio',
    name: 'Twilio',
    type: 'sms',
    icon: Phone,
    description: 'SMS and WhatsApp messaging via Twilio',
    features: ['SMS', 'WhatsApp', 'Voice calls', 'Global delivery'],
    pricing: 'Pay per message',
    setupComplexity: 'Easy',
    color: 'red'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    type: 'email',
    icon: Mail,
    description: 'Reliable email delivery service',
    features: ['Email delivery', 'Templates', 'Analytics', 'High deliverability'],
    pricing: 'Free tier available',
    setupComplexity: 'Easy',
    color: 'blue'
  },
  {
    id: 'slack',
    name: 'Slack',
    type: 'webhook',
    icon: MessageSquare,
    description: 'Send notifications to Slack channels',
    features: ['Channel notifications', 'Direct messages', 'Rich formatting', 'Bot integration'],
    pricing: 'Free with Slack',
    setupComplexity: 'Easy',
    color: 'purple'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    type: 'webhook',
    icon: Bot,
    description: 'Send alerts to Microsoft Teams channels',
    features: ['Channel notifications', 'Adaptive cards', 'Rich formatting', 'Enterprise integration'],
    pricing: 'Free with Teams',
    setupComplexity: 'Medium',
    color: 'blue'
  },
  {
    id: 'make',
    name: 'Make.com',
    type: 'webhook',
    icon: Workflow,
    description: 'Powerful visual workflow automation platform',
    features: ['Visual workflows', '1000+ app integrations', 'Advanced logic', 'Real-time execution'],
    pricing: 'Free tier available',
    setupComplexity: 'Medium',
    color: 'indigo'
  },
  {
    id: 'n8n',
    name: 'n8n',
    type: 'webhook',
    icon: GitBranch,
    description: 'Open-source workflow automation tool',
    features: ['Self-hosted option', 'Custom nodes', 'Code integration', 'Advanced branching'],
    pricing: 'Open source / Cloud plans',
    setupComplexity: 'Advanced',
    color: 'pink'
  },
  {
    id: 'webhook',
    name: 'Custom Webhooks',
    type: 'webhook',
    icon: Webhook,
    description: 'Send HTTP POST requests to custom endpoints',
    features: ['Custom payloads', 'Flexible integration', 'Real-time delivery', 'Retry logic'],
    pricing: 'Free',
    setupComplexity: 'Advanced',
    color: 'gray'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    type: 'webhook',
    icon: Zap,
    description: 'Connect to 5000+ apps via Zapier webhooks',
    features: ['5000+ app integrations', 'Workflow automation', 'Multi-step zaps', 'Conditional logic'],
    pricing: 'Free tier available',
    setupComplexity: 'Easy',
    color: 'orange'
  }
];

const statusConfig = {
  connected: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Connected' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
  testing: { icon: TestTube, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Testing' },
};

export default function ChannelProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [testingProviders, setTestingProviders] = useState(new Set());

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const providerList = await NotificationProvider.list();
      setProviders(providerList);
    } catch (error) {
      console.error('Failed to load providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (providerTemplate) => {
    setSelectedProvider(providerTemplate);
    setShowConfigModal(true);
  };

  const handleConfigure = (provider) => {
    // Find the template for this provider
    const template = AVAILABLE_PROVIDERS.find(p => p.id === provider.provider_name.toLowerCase());
    setSelectedProvider({ ...template, existingProvider: provider });
    setShowConfigModal(true);
  };

  const handleTest = async (provider) => {
    setTestingProviders(prev => new Set([...prev, provider.id]));
    
    try {
      // Simulate testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update provider status
      await NotificationProvider.update(provider.id, {
        delivery_stats: {
          ...provider.delivery_stats,
          success_rate: 0.98,
          avg_latency_ms: 150
        }
      });
      
      loadProviders();
    } catch (error) {
      console.error('Provider test failed:', error);
    } finally {
      setTestingProviders(prev => {
        const newSet = new Set(prev);
        newSet.delete(provider.id);
        return newSet;
      });
    }
  };

  const handleModalComplete = () => {
    setShowConfigModal(false);
    setSelectedProvider(null);
    loadProviders();
  };

  const getProviderStatus = (provider) => {
    if (testingProviders.has(provider.id)) {
      return statusConfig.testing;
    }
    if (provider.is_active && provider.delivery_stats?.success_rate > 0.9) {
      return statusConfig.connected;
    }
    return statusConfig.error;
  };

  const isProviderConnected = (providerId) => {
    return providers.some(p => p.provider_name.toLowerCase() === providerId && p.is_active);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Notification Channel Providers</h3>
          <p className="text-sm text-slate-600">
            Configure global notification providers that organizations can use for their alert channels.
          </p>
        </div>
      </div>

      {/* Connected Providers */}
      {providers.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Connected Providers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => {
              const template = AVAILABLE_PROVIDERS.find(p => p.id === provider.provider_name.toLowerCase()) || {};
              const IconComponent = template.icon || Settings;
              const status = getProviderStatus(provider);
              const StatusIcon = status.icon;

              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${template.color}-100 rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`w-5 h-5 text-${template.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{provider.provider_name}</CardTitle>
                          <p className="text-xs text-slate-500 capitalize">{provider.provider_type}</p>
                        </div>
                      </div>
                      <Badge className={`${status.bg} ${status.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {provider.delivery_stats && (
                      <div className="text-xs text-slate-600 space-y-1 mb-4">
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span>{Math.round((provider.delivery_stats.success_rate || 0) * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Latency:</span>
                          <span>{provider.delivery_stats.avg_latency_ms || 0}ms</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleConfigure(provider)}
                        className="flex-1"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleTest(provider)}
                        disabled={testingProviders.has(provider.id)}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Providers */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-800">Available Providers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_PROVIDERS.map((provider) => {
            const IconComponent = provider.icon;
            const isConnected = isProviderConnected(provider.id);

            return (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${provider.color}-100 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 text-${provider.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <p className="text-sm text-slate-500 capitalize">{provider.type} Provider</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">{provider.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-slate-700 uppercase tracking-wide">Features</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {provider.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Pricing: {provider.pricing}</span>
                    <span>Setup: {provider.setupComplexity}</span>
                  </div>

                  <Button 
                    onClick={() => handleConnect(provider)} 
                    disabled={isConnected}
                    className="w-full"
                    variant={isConnected ? "secondary" : "default"}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Connect {provider.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {showConfigModal && selectedProvider && (
        <ProviderConfigModal
          provider={selectedProvider}
          onComplete={handleModalComplete}
          onCancel={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}
