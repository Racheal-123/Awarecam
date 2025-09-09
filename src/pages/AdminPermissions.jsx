import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Save, Building, Users, CreditCard, Bot, Headphones } from 'lucide-react';

import { User } from '@/api/entities';

const permissionConfig = [
  { id: 'can_manage_orgs', label: 'Manage Organizations', description: 'Can create, view, and manage all tenant organizations.', icon: Building },
  { id: 'can_manage_users', label: 'Manage All Users', description: 'Can view and manage all users across all organizations.', icon: Users },
  { id: 'can_manage_billing', label: 'Manage Billing', description: 'Can view and manage platform-wide billing and revenue.', icon: CreditCard },
  { id: 'can_manage_ai_assistant', label: 'Manage AI Assistant', description: 'Can configure the global AI assistant settings.', icon: Bot },
  { id: 'can_manage_support', label: 'Manage Support Tickets', description: 'Can view and respond to platform support tickets.', icon: Headphones },
];

export default function AdminPermissions() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAdmins = async () => {
      setLoading(true);
      try {
        const adminUsers = await User.filter({ role: 'admin' });
        setAdmins(adminUsers);
        if (adminUsers.length > 0) {
          handleSelectAdmin(adminUsers[0]);
        }
      } catch (error) {
        console.error("Failed to load admin users", error);
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, []);
  
  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
    setPermissions(admin.permissions || {});
  };

  const handlePermissionChange = (permissionId, value) => {
    setPermissions(prev => ({ ...prev, [permissionId]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedAdmin) return;
    setSaving(true);
    try {
      await User.update(selectedAdmin.id, { permissions });
      // Update local state to reflect changes
      setAdmins(admins.map(admin => admin.id === selectedAdmin.id ? { ...admin, permissions } : admin));
    } catch (error) {
      console.error("Failed to save permissions", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-purple-600" />
          Admin Role Permissions
        </h1>
        <p className="text-slate-600 mt-1">
          As Super Admin, you can grant or revoke specific platform management capabilities for your Admin users.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select an Admin</CardTitle>
            <CardDescription>Choose an admin to manage their permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length > 0 ? (
              <ul className="space-y-2">
                {admins.map(admin => (
                  <li key={admin.id}>
                    <button 
                      onClick={() => handleSelectAdmin(admin)}
                      className={`w-full text-left p-3 rounded-lg border ${selectedAdmin?.id === admin.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'}`}
                    >
                      <p className="font-semibold">{admin.full_name}</p>
                      <p className="text-sm text-slate-500">{admin.email}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-center text-slate-500 py-8">No admin users found. You can create them in the Global User Management page.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedAdmin ? `Permissions for ${selectedAdmin.full_name}` : 'No Admin Selected'}
            </CardTitle>
            <CardDescription>
              Toggle access to different sections of the platform management area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAdmin ? (
              <div className="space-y-4">
                {permissionConfig.map(({ id, label, description, icon: Icon }) => (
                  <div key={id} className="flex items-start justify-between p-4 rounded-lg border bg-slate-50/50">
                    <div className="flex items-start gap-4">
                       <Icon className="w-6 h-6 text-slate-500 mt-1" />
                       <div>
                          <Label htmlFor={id} className="text-base font-medium">{label}</Label>
                          <p className="text-sm text-slate-600">{description}</p>
                       </div>
                    </div>
                    <Switch
                      id={id}
                      checked={!!permissions[id]}
                      onCheckedChange={(value) => handlePermissionChange(id, value)}
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveChanges} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-center text-slate-500 py-8">Select an admin from the list to begin.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}