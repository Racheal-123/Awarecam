
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users,
  CreditCard, 
  Settings,
  Save,
  ArrowLeft,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Shield,
  RefreshCcw,
  PlayCircle,
  X // Added for modal close button
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';
import { format } from 'date-fns';
import OrgInviteUserModal from '@/components/admin/OrgInviteUserModal';

export default function AdminOrganizationDetails() {
  const [organization, setOrganization] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]); // New state
  const [showBillingHistory, setShowBillingHistory] = useState(false); // New state

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(window.location.search);
      const orgId = params.get('org_id');
      
      if (!orgId) {
        setError('No organization ID provided in URL');
        return;
      }

      const [orgData, userData] = await Promise.all([
        Organization.get(orgId),
        User.filter({ organization_id: orgId })
      ]);

      setOrganization(orgData);
      setOrgUsers(userData);
    } catch (error) {
      console.error('Error loading organization data:', error);
      setError(`Failed to load organization data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    // Optionally, show a confirmation message, though the main action is outside the app
    console.log("Invitation flow initiated. Refreshing user list.");
    loadOrganizationData(); // Refresh user list to potentially reflect new invites or accepted users
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!organization) return;

    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const updatedData = {
        name: formData.get('name'),
        industry_type: formData.get('industry_type'),
        business_description: formData.get('business_description'),
        employee_count: parseInt(formData.get('employee_count')),
        address: formData.get('address'),
        billing_email: formData.get('billing_email'),
        subscription_plan: formData.get('subscription_plan'),
        monthly_revenue: parseFloat(formData.get('monthly_revenue') || 0)
      };

      await Organization.update(organization.id, updatedData);
      setOrganization({ ...organization, ...updatedData });

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMsg.textContent = 'Organization updated successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Error updating organization. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetOnboarding = async () => {
    if (window.confirm('Are you sure you want to reset the onboarding progress for this organization? This action cannot be undone.')) {
        try {
            await Organization.update(organization.id, {
                onboarding_completed: false,
                onboarding_step: 1
            });
            // Refresh local state to reflect the change immediately
            setOrganization(prev => ({...prev, onboarding_completed: false, onboarding_step: 1}));
            alert('Onboarding has been reset successfully.');
        } catch (error) {
            console.error('Error resetting onboarding:', error);
            alert('Failed to reset onboarding.');
        }
    }
  };

  const handleWorkflowToggle = async (enabled) => {
    try {
      await Organization.update(organization.id, { workflow_addon_enabled: enabled });
      setOrganization({ ...organization, workflow_addon_enabled: enabled });
    } catch (error) {
      console.error('Error updating workflow addon:', error);
    }
  };

  const handleLoginAsAdmin = () => {
    if (!organization) return;
    
    // Navigate to the organization's dashboard as if logged in as their admin
    const adminUrl = `${createPageUrl('Dashboard')}?org_id=${organization.id}&role_view=organization_admin`;
    window.open(adminUrl, '_blank');
  };

  const handleViewAsOrganization = () => {
    if (!organization) return;
    
    // Navigate to organization view in current tab
    const orgUrl = `${createPageUrl('Dashboard')}?org_id=${organization.id}&role_view=organization_admin`;
    window.location.href = orgUrl;
  };

  const handleViewBillingHistory = async () => {
    try {
      // Mock billing history data - replace with actual API call
      const mockBillingHistory = [
        {
          id: '1',
          date: '2024-12-01',
          amount: 1500,
          status: 'paid',
          description: 'Monthly subscription - Professional Plan',
          invoice_number: 'INV-2024-001'
        },
        {
          id: '2',
          date: '2024-11-01',
          amount: 1500,
          status: 'paid',
          description: 'Monthly subscription - Professional Plan',
          invoice_number: 'INV-2024-002'
        },
        {
          id: '3',
          date: '2024-10-01',
          amount: 1400,
          status: 'paid',
          description: 'Monthly subscription - Basic Plan',
          invoice_number: 'INV-2024-003'
        },
        {
          id: '4',
          date: '2024-09-01',
          amount: 1400,
          status: 'paid',
          description: 'Monthly subscription - Basic Plan',
          invoice_number: 'INV-2024-004'
        },
      ];
      
      setBillingHistory(mockBillingHistory);
      setShowBillingHistory(true);
    } catch (error) {
      console.error('Error loading billing history:', error);
      alert('Failed to load billing history');
    }
  };

  const handleManageSubscription = () => {
    if (!organization) return;
    
    // Navigate to subscription management with organization context
    const subscriptionUrl = `${createPageUrl('AdminBilling')}?org_id=${organization.id}&tab=subscriptions`;
    window.location.href = subscriptionUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('AdminOrganizationManagement')} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Organization Details</h1>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Organization</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl('AdminOrganizationManagement')}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Organizations
                </Button>
              </Link>
              <Button onClick={loadOrganizationData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('AdminOrganizationManagement')} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Organization Details</h1>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Organization Not Found</h3>
            <p className="text-slate-600 mb-6">The requested organization could not be found.</p>
            <Link to={createPageUrl('AdminOrganizationManagement')}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscriptionColors = {
    trial: 'bg-blue-100 text-blue-800',
    basic: 'bg-green-100 text-green-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('AdminOrganizationManagement')} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              {organization.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={subscriptionColors[organization.subscription_plan]}>
                {organization.subscription_plan} plan
              </Badge>
              <span className="text-slate-500 text-sm">
                Created {format(new Date(organization.created_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleLoginAsAdmin}>
            <Shield className="w-4 h-4 mr-2" />
            Login as Admin
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewAsOrganization}>
            View as Organization
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="users">Users ({orgUsers.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900">{orgUsers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">${organization.monthly_revenue || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Health Score</p>
                    <p className="text-2xl font-bold text-slate-900">{organization.health_score || 100}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Last Activity</p>
                    <p className="text-sm font-medium text-slate-900">
                      {organization.last_activity ? format(new Date(organization.last_activity), 'MMM d') : 'No activity'}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Management */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Management</CardTitle>
              <CardDescription>View status and manage the onboarding flow for this organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div>
                        <h4 className="font-medium">Onboarding Status</h4>
                        <p className="text-sm text-slate-600">
                            {organization.onboarding_completed 
                                ? 'The user has completed the initial setup wizard.' 
                                : `User is currently on Step ${organization.onboarding_step || 1} of 3.`
                            }
                        </p>
                    </div>
                    <Badge className={organization.onboarding_completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {organization.onboarding_completed ? 'Completed' : 'In Progress'}
                    </Badge>
                </div>
                <div className="flex gap-3">
                    <Link to={`${createPageUrl('Welcome')}?org_id=${organization.id}`}>
                      <Button variant="outline">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Preview Onboarding Flow
                      </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleResetOnboarding}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reset Progress
                    </Button>
                </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative actions for this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Workflow Add-on</h4>
                    <p className="text-sm text-slate-600">Enable advanced workflow management features</p>
                  </div>
                  <Switch
                    checked={organization.workflow_addon_enabled}
                    onCheckedChange={handleWorkflowToggle}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage organization profile and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveChanges} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                    <Input name="name" defaultValue={organization.name} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                    <Select name="industry_type" defaultValue={organization.industry_type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Employee Count</label>
                    <Select name="employee_count" defaultValue={organization.employee_count?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1-10</SelectItem>
                        <SelectItem value="11">11-50</SelectItem>
                        <SelectItem value="51">51-200</SelectItem>
                        <SelectItem value="201">201-500</SelectItem>
                        <SelectItem value="501">501+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Billing Email</label>
                    <Input name="billing_email" type="email" defaultValue={organization.billing_email} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Plan</label>
                    <Select name="subscription_plan" defaultValue={organization.subscription_plan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Revenue ($)</label>
                    <Input name="monthly_revenue" type="number" defaultValue={organization.monthly_revenue} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Description</label>
                  <Textarea name="business_description" defaultValue={organization.business_description} rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <Textarea name="address" defaultValue={organization.address} rows={2} />
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Users</CardTitle>
                  <CardDescription>Manage users within this organization</CardDescription>
                </div>
                <Button onClick={() => setShowInviteModal(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orgUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{user.full_name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-sm text-slate-500">{user.title || 'No title'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-100 text-slate-800">
                        {user.role || 'User'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {orgUsers.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No users found in this organization.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Organization billing details and subscription management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-900">Current Plan</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1 capitalize">
                      {organization.subscription_plan}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-900">Monthly Revenue</h4>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      ${organization.monthly_revenue || 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Workflow Add-on</h4>
                      <p className="text-sm text-slate-600">
                        ${organization.workflow_addon_enabled ? (organization.workflow_addon_price || 99) : 0}/month
                      </p>
                    </div>
                    <Badge className={organization.workflow_addon_enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                      {organization.workflow_addon_enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleViewBillingHistory}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    View Billing History
                  </Button>
                  <Button variant="outline" onClick={handleManageSubscription}>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {showInviteModal && organization && (
        <OrgInviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInviteSuccess}
          organizationId={organization.id}
          organizationName={organization.name}
        />
      )}

      {/* Billing History Modal */}
      {showBillingHistory && organization && (
        <BillingHistoryModal
          organization={organization}
          billingHistory={billingHistory}
          onClose={() => setShowBillingHistory(false)}
        />
      )}
    </div>
  );
}

// Billing History Modal Component
function BillingHistoryModal({ organization, billingHistory, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Billing History</h2>
            <p className="text-sm text-slate-600 mt-1">{organization.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-slate-900">{invoice.description}</h4>
                    <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span>{format(new Date(invoice.date), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>{invoice.invoice_number}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${invoice.amount}</p>
                  <Button variant="ghost" size="sm" className="mt-1">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {billingHistory.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Billing History</h3>
              <p className="text-slate-500">This organization has no billing history yet.</p>
            </div>
          )}
        </div>

        <div className="border-t p-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
