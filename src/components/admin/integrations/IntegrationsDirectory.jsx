
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Loader2, CheckCircle, AlertTriangle, XCircle, Power, PowerOff, TestTube } from 'lucide-react';
import { PlatformIntegration } from '@/api/entities';
import IntegrationFormModal from '@/components/admin/integrations/IntegrationFormModal';

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  inactive: { icon: PowerOff, color: 'text-slate-600', bg: 'bg-slate-100' },
  maintenance: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
};

const healthConfig = {
  healthy: { icon: CheckCircle, color: 'text-green-600', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-amber-600', label: 'Degraded' },
  down: { icon: XCircle, color: 'text-red-600', label: 'Down' },
  untested: { icon: TestTube, color: 'text-slate-500', label: 'Untested' },
};

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

export default function IntegrationsDirectory() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await PlatformIntegration.list();
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to load platform integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingIntegration(null);
    setShowForm(true);
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      try {
        await PlatformIntegration.delete(id);
        loadIntegrations();
      } catch (error) {
        console.error('Failed to delete integration:', error);
      }
    }
  };
  
  const handleToggleStatus = async (integration) => {
    try {
        const newStatus = integration.status === 'active' ? 'inactive' : 'active';
        await PlatformIntegration.update(integration.id, { status: newStatus });
        loadIntegrations();
    } catch(error) {
        console.error('Failed to toggle integration status:', error);
    }
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingIntegration(null);
    loadIntegrations();
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Global</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.length > 0 ? integrations.map(integration => {
              const StatusIcon = statusConfig[integration.status]?.icon || PowerOff;
              const HealthIcon = healthConfig[integration.health_status]?.icon || TestTube;

              return (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">{integration.name}</TableCell>
                  <TableCell><Badge variant="outline">{integration.type}</Badge></TableCell>
                  <TableCell>
                    <Badge className={`${statusConfig[integration.status]?.bg} ${statusConfig[integration.status]?.color} border-0 capitalize`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className={`flex items-center gap-2 text-sm ${healthConfig[integration.health_status]?.color}`}>
                        <HealthIcon className="w-4 h-4" />
                        <span>{healthConfig[integration.health_status]?.label}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={integration.is_global ? 'default' : 'secondary'}>
                      {integration.is_global ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>{integration.usage_count} orgs</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(integration)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Test Connection</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(integration)}>
                            {integration.status === 'active' ? 'Disable' : 'Enable'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(integration.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan="7" className="text-center py-8 text-slate-500">
                  No platform integrations configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showForm && (
        <IntegrationFormModal
          integration={editingIntegration}
          onComplete={handleFormComplete}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
