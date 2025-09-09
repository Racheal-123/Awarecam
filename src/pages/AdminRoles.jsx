import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { IdCard, PlusCircle, Search, Edit } from 'lucide-react';

import { EmployeeRole } from '@/api/entities';
import CreateEmployeeRoleModal from '@/components/admin/roles/CreateEmployeeRoleModal';
import EditEmployeeRoleModal from '@/components/admin/roles/EditEmployeeRoleModal';

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const roleData = await EmployeeRole.list();
      setRoles(roleData);
    } catch (error) {
      console.error("Failed to load employee roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadData();
  };

  const handleEditSuccess = () => {
    setEditingRole(null);
    loadData();
  };

  const filteredRoles = roles.filter(role =>
    role.role_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <IdCard className="w-8 h-8 text-green-600" />
            Employee Role Management
          </h1>
          <p className="text-slate-600 mt-1">Define and manage standardized employee roles and their default assignments.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Templates</CardTitle>
          <CardDescription>This library of roles is used to intelligently assign workflows to employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search roles by name or description..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industry Context</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Default Workflows</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredRoles.map(role => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{role.role_display_name}</div>
                      <div className="text-sm text-slate-500">{role.role_description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(role.industry_context || []).map(ind => 
                          <Badge key={ind} variant="secondary" className="capitalize">{ind}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {(role.default_workflows || []).length} assigned
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingRole(role)}
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

      {showCreateModal && (
        <CreateEmployeeRoleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingRole && (
        <EditEmployeeRoleModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}