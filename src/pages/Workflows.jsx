
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Import Tabs components
import {
  Plus,
  Search,
  Filter,
  ClipboardCheck,
  Crown,
  Play,
  Edit,
  Copy,
  MoreVertical,
  Clock,
  Users,
  Camera,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  Sparkles,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkflowTemplate } from '@/api/entities';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';

import WorkflowBuilder from '@/components/workflows/WorkflowBuilder';
import TemplateLibrary from '@/components/workflows/TemplateLibrary';
import UpgradePrompt from '@/components/workflows/UpgradePrompt';
import AssignmentsTab from '@/components/workflows/AssignmentsTab'; // Import new component

export default function WorkflowsPage() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const orgData = await Organization.list();
      if (orgData.length > 0) {
        setOrganization(orgData[0]);
      }

      const templateData = await WorkflowTemplate.list();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.template_category === categoryFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowBuilder(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  const handleBuilderComplete = async (templateData) => {
    try {
      if (editingTemplate && editingTemplate.id) {
        await WorkflowTemplate.update(editingTemplate.id, templateData);
      } else {
        await WorkflowTemplate.create(templateData);
      }
      setShowBuilder(false);
      setEditingTemplate(null);
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const convertLibraryTemplate = (template) => {
    return {
      name: template.name,
      description: template.description,
      template_category: template.category,
      industry_type: organization?.industry_type,
      estimated_duration: template.setupTime, // Use setupTime from library template
      priority: 'medium',
      steps: template.steps.map((s, i) => ({ // Assume template.steps is an array of step objects
        step_number: i + 1,
        title: s.title,
        description: s.description,
        step_type: 'checklist', // Default step type for library imports
        is_mandatory: true,
        requires_approval: false,
      })),
      required_skills: [],
      required_certifications: [],
      is_active: true,
      approval_status: 'draft', // New library templates start as draft
      // No ID, so it's treated as new when creating
    };
  };

  const handleUseTemplateAsIs = async (template) => {
    setShowLibrary(false);
    const workflowTemplateData = convertLibraryTemplate(template);
    try {
      await WorkflowTemplate.create(workflowTemplateData);
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Failed to create template from library:', error);
    }
  };

  const handleCustomizeTemplate = (template) => {
    setShowLibrary(false);
    const workflowTemplate = convertLibraryTemplate(template);
    setEditingTemplate(workflowTemplate);
    setShowBuilder(true);
  };

  const getTaskStats = () => {
    const active = templates.filter(t => t.is_active).length;
    const approved = templates.filter(t => t.approval_status === 'approved').length;
    const categories = [...new Set(templates.map(t => t.template_category))].length;
    return { total: templates.length, active, approved, categories };
  };

  const stats = getTaskStats();

  // Check if workflow addon is enabled
  if (!organization?.workflow_addon_enabled) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workflow Templates</h1>
            <p className="text-slate-600 mt-2">Create and manage reusable workflow templates</p>
          </div>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Crown className="w-4 h-4 mr-2" />
            Workflow Add-On Required
          </Badge>
        </div>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Workflow Template Marketplace</h2>
            <p className="text-purple-700 mb-6 max-w-2xl mx-auto">
              Access hundreds of industry-proven templates with AI-powered recommendations and intelligent automation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Template Marketplace</h4>
                <p className="text-sm text-purple-600">500+ proven workflows</p>
              </div>
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">AI Integration</h4>
                <p className="text-sm text-purple-600">Smart camera validation</p>
              </div>
              <div className="text-center p-4">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">ROI Tracking</h4>
                <p className="text-sm text-purple-600">Measure real impact</p>
              </div>
            </div>
            <UpgradePrompt />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflow Templates</h1>
          <p className="text-slate-600 mt-2">
            Create and manage reusable workflows for your team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowLibrary(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            Browse Library
          </Button>
          <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Custom
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="assignments">Assignments & Schedules</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 text-sm font-medium">Total Templates</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-sm font-medium">Active Templates</p>
                      <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 text-sm font-medium">From Library</p>
                      <p className="text-3xl font-bold text-purple-900">{Math.floor(stats.total * 0.7)}</p>
                    </div>
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-700 text-sm font-medium">Categories</p>
                      <p className="text-3xl font-bold text-amber-900">{stats.categories}</p>
                    </div>
                    <Filter className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Template Library Integration Banner */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Discover New Templates</h3>
                    <p className="text-blue-700">Browse 500+ industry-proven workflows with AI recommendations</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowLibrary(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Explore Library
                  <Eye className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-3">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {filteredTemplates.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700">No Templates Found</h3>
                  <p className="text-slate-500 mt-2">
                    {templates.length === 0
                      ? 'Get started by creating your first workflow template'
                      : 'Try adjusting your search or filter criteria'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onEdit={handleEditTemplate}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="assignments" className="mt-6">
          <AssignmentsTab organization={organization} />
        </TabsContent>
      </Tabs>


      {/* Modals */}
      {showBuilder && (
        <WorkflowBuilder
          template={editingTemplate}
          organization={organization}
          onComplete={handleBuilderComplete}
          onCancel={() => {
            setShowBuilder(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {showLibrary && (
        <TemplateLibrary
          industryType={organization?.industry_type}
          onUseAsIs={handleUseTemplateAsIs}
          onCustomize={handleCustomizeTemplate}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, index, onEdit }) {
  const categoryColors = {
    safety: 'bg-red-100 text-red-800',
    maintenance: 'bg-blue-100 text-blue-800',
    cleaning: 'bg-green-100 text-green-800',
    inspection: 'bg-purple-100 text-purple-800',
    security: 'bg-slate-100 text-slate-800',
    quality: 'bg-amber-100 text-amber-800'
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800',
    pending_approval: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold mb-2">{template.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={categoryColors[template.template_category]}>
                  {template.template_category}
                </Badge>
                <Badge className={statusColors[template.approval_status]}>
                  {template.approval_status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 line-clamp-3">{template.description}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <ClipboardCheck className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{template.steps?.length || 0} steps</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{template.estimated_duration || 0}m</span>
            </div>
          </div>

          {template.steps && template.steps.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {template.steps.slice(0, 3).map((step, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {step.step_type === 'photo_required' ? '📷' :
                     step.step_type === 'video_required' ? '🎥' :
                     step.step_type === 'signature_required' ? '✍️' :
                     step.step_type === 'camera_validation' ? '🎯' : '✓'}
                    {step.title}
                  </Badge>
                ))}
                {template.steps.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.steps.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
