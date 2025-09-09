import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, PlusCircle, Search, Edit } from 'lucide-react';

import { WorkflowTemplate } from '@/api/entities';
import { WorkflowTemplateCategory } from '@/api/entities';
import CreateWorkflowTemplateModal from '@/components/admin/workflows/CreateWorkflowTemplateModal';
import EditWorkflowTemplateModal from '@/components/admin/workflows/EditWorkflowTemplateModal';
import CreateCategoryModal from '@/components/admin/workflows/CreateCategoryModal';

export default function AdminWorkflows() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templateData, categoryData] = await Promise.all([
        WorkflowTemplate.list(),
        WorkflowTemplateCategory.list()
      ]);
      setTemplates(templateData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to load workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSuccess = () => {
    setShowCreateTemplateModal(false);
    setEditingTemplate(null);
    loadData();
  };

  const handleCategorySuccess = () => {
    setShowCreateCategoryModal(false);
    loadData();
  };

  const filteredTemplates = templates.filter(template =>
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.template_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const complexityColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Workflow Template Management
          </h1>
          <p className="text-slate-600 mt-1">Create, manage, and categorize workflow templates for all organizations.</p>
        </div>
        <Button onClick={() => setShowCreateTemplateModal(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Template Library</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>Browse and manage the global library of workflow templates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search templates by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Template Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Complexity</th>
                       <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Deployments</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredTemplates.map(template => (
                      <tr key={template.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{template.name}</div>
                          <div className="text-sm text-slate-500">{template.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{template.template_category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${complexityColors[template.template_complexity]}`}>{template.template_complexity}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{template.total_deployments || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Workflow Categories</CardTitle>
                <CardDescription>Manage the categories used to organize templates.</CardDescription>
              </div>
              <Button onClick={() => setShowCreateCategoryModal(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </CardHeader>
            <CardContent>
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-semibold">{category.category_name}</p>
                    <p className="text-sm text-slate-500">{category.category_description}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showCreateTemplateModal && (
        <CreateWorkflowTemplateModal
          onClose={() => setShowCreateTemplateModal(false)}
          onSuccess={handleTemplateSuccess}
        />
      )}

      {editingTemplate && (
        <EditWorkflowTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={handleTemplateSuccess}
        />
      )}

      {showCreateCategoryModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateCategoryModal(false)}
          onSuccess={handleCategorySuccess}
        />
      )}
    </div>
  );
}