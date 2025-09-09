import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Briefcase,
  PlusCircle,
  Edit,
  CheckCircle,
  Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { Organization } from '@/api/entities';
import { Link } from 'react-router-dom';
import CreateOrganizationModal from '@/components/admin/CreateOrganizationModal';

export default function AdminOrganizationManagement() {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    const filtered = organizations.filter(org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.industry_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrgs(filtered);
  }, [organizations, searchTerm]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const orgs = await Organization.list('-created_date');
      setOrganizations(orgs);
      setFilteredOrgs(orgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadOrganizations(); // Refresh the list
  };

  const subscriptionColors = {
    trial: 'bg-blue-100 text-blue-800',
    basic: 'bg-green-100 text-green-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  };

  const createPageUrl = (path) => {
    return path.startsWith('/') ? path : `/${path}`;
  };

  const createAdminOrgDetailsUrl = (orgId) => {
    return `${createPageUrl('AdminOrganizationDetails')}?org_id=${orgId}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p>Loading organization data...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Organization Management
          </h1>
          <p className="text-slate-600 mt-1">Oversee and manage all tenant organizations on the platform.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Organization
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search organizations by name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
           <Badge className="ml-4 bg-red-100 text-red-800 text-sm">
            {organizations.length} Organizations
          </Badge>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Onboarding Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{org.name}</div>
                  <div className="text-sm text-slate-500 capitalize">{org.industry_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${subscriptionColors[org.subscription_plan]} capitalize`}>
                    {org.subscription_plan}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {org.onboarding_completed ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1.5" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">
                      <Loader className="w-3 h-3 mr-1.5 animate-spin" />
                      In Progress
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {format(new Date(org.created_date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link to={createAdminOrgDetailsUrl(org.id)}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}