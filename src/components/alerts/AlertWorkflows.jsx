import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertWorkflow } from '@/api/entities';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  Zap,
  Clock,
  Target,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertWorkflows({ onEdit, channels }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, orgData, workflowData] = await Promise.all([
        User.me(),
        Organization.list(),
        AlertWorkflow.list()
      ]);
      
      setUser(userData);
      setOrganization(orgData[0]);
      setWorkflows(workflowData.filter(w => w.organization_id === orgData[0]?.id));
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (workflow) => {
    try {
      await AlertWorkflow.update(workflow.id, { is_active: !workflow.is_active });
      loadData();
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const handleDelete = async (workflowId) => {
    if (confirm('Are you sure you want to delete this workflow? This cannot be undone.')) {
      try {
        await AlertWorkflow.delete(workflowId);
        loadData();
      } catch (error) {
        console.error('Failed to delete workflow:', error);
      }
    }
  };

  const handleClone = async (workflow) => {
    try {
      const clonedData = {
        ...workflow,
        workflow_name: `${workflow.workflow_name} (Copy)`,
        is_active: false
      };
      delete clonedData.id;
      delete clonedData.created_date;
      delete clonedData.updated_date;
      
      await AlertWorkflow.create(clonedData);
      loadData();
    } catch (error) {
      console.error('Failed to clone workflow:', error);
    }
  };

  const renderWorkflowSummary = (workflow) => {
    const triggers = workflow.flow_definition?.triggers || [];
    const actions = workflow.flow_definition?.actions || [];
    
    return (
      <div className="text-sm text-slate-600">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4" />
          <span className="font-medium">IF:</span>
          <span>
            {triggers.length > 0 
              ? triggers.map(t => t.type.replace('_', ' ')).join(', ')
              : 'No triggers'
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span className="font-medium">THEN:</span>
          <span>
            {actions.length > 0 
              ? actions.map(a => a.type.replace('_', ' ')).join(', ')
              : 'No actions'
            }
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading workflows...</div>;
  }

  return (
    <div className="space-y-4">
      {workflows.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Alert Flows Yet</h3>
          <p className="text-slate-500 mb-4">
            Create your first automated flow to handle events and notifications intelligently.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {workflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`border-l-4 ${workflow.is_active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{workflow.workflow_name}</CardTitle>
                      <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {workflow.execution_count > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {workflow.execution_count} runs
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={() => handleToggleActive(workflow)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(workflow)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Flow
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClone(workflow)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Clone Flow
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(workflow.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Flow
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-slate-500 mt-1">{workflow.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {renderWorkflowSummary(workflow)}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}