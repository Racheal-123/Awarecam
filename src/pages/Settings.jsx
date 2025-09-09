
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building,
  CreditCard,
  Users as UsersIcon,
  Save,
  AlertCircle,
  Zap,
  Package,
  Camera,
  Server,
  Cpu,
  Download,
  FileText,
  Plus,
  Bell,
  Workflow,
  Loader2
} from 'lucide-react';
import { User as UserEntity } from '@/api/entities';
import { Organization } from '@/api/entities';
import NotificationSettingsPanel from '@/components/settings/NotificationSettingsPanel';
import IntegrationsPanel from '@/components/settings/IntegrationsPanel'; // New Import

export default function SettingsPage() {
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // New state for active tab

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);

      const orgData = await Organization.list();
      if (orgData.length > 0) {
        setOrganization(orgData[0]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgUpdate = async (updates) => {
    if (!organization) return;
    
    try {
      setSaving(true);
      await Organization.update(organization.id, updates);
      setOrganization(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Failed to update organization:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (updates) => {
    if (!user) return;
    
    try {
      setSaving(true);
      await UserEntity.updateMyUserData(updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setSaving(false);
    }
  };

  // handleFeatureToggle function removed as the "Features" tab is no longer present in the UI based on the outline.
  // If this logic is still needed, it should be re-integrated elsewhere or in a different component.

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8"> {/* Updated padding and spacing */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Organization Settings</h1>
        <p className="text-slate-600 mt-1">Manage your organization profile, features, and team settings.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6"> {/* Added value and onValueChange */}
        <TabsList className="grid w-full grid-cols-6"> {/* Updated grid columns */}
          <TabsTrigger value="general">General</TabsTrigger> {/* Renamed from 'organization' */}
          <TabsTrigger value="integrations">Integrations</TabsTrigger> {/* New tab */}
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="cameras">Cameras</TabsTrigger> {/* New tab */}
          <TabsTrigger value="users">Team</TabsTrigger> {/* Renamed from 'team' */}
          <TabsTrigger value="billing">Billing</TabsTrigger> {/* New tab */}
        </TabsList>

        <TabsContent value="general" className="space-y-6"> {/* Renamed tab value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organization Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={organization?.name || ''}
                    onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry Type</Label>
                  <Select 
                    value={organization?.industry_type || ''} 
                    onValueChange={(value) => setOrganization(prev => ({ ...prev, industry_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse & Distribution</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={organization?.business_description || ''}
                  onChange={(e) => setOrganization(prev => ({ ...prev, business_description: e.target.value }))}
                  placeholder="Describe your business operations..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Select 
                    value={organization?.employee_count_range || ''} 
                    onValueChange={(value) => setOrganization(prev => ({ ...prev, employee_count_range: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currentCameras">Current Cameras</Label>
                  <Input
                    id="currentCameras"
                    type="number"
                    value={organization?.camera_count_current || ''}
                    onChange={(e) => setOrganization(prev => ({ ...prev, camera_count_current: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleOrgUpdate(organization)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Previous "Features" tab content has been removed as the tab itself is removed from the new structure. */}
        </TabsContent>

        <TabsContent value="integrations"> {/* New Integrations tab */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations & Notifications</CardTitle>
              <CardDescription>
                Connect external services to receive alerts and automate workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="p-1">
          <NotificationSettingsPanel />
        </TabsContent>

        <TabsContent value="cameras" className="p-1"> {/* New Cameras tab placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Camera management features coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="p-1"> {/* Renamed from 'team' */}
          <TeamTab users={[]} organization={organization} />
        </TabsContent>

        <TabsContent value="billing" className="p-1"> {/* New Billing tab placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Billing and subscription details coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamTab({ users, organization }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Team Management
          </CardTitle>
          <CardDescription>Manage your team members and their access levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Team Management</h3>
            <p className="text-slate-600 mb-6">
              Invite team members, assign roles, and manage permissions.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Invite Team Member
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
