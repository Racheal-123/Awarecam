import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from '@/api/entities';
import { Role } from '@/api/entities';
import { Organization } from '@/api/entities';
import { format } from 'date-fns';
import EditUserModal from '@/components/admin/EditUserModal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const roleMap = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role;
      return acc;
    }, {});
  }, [roles]);

  const superAdminRoleId = useMemo(() => roles.find(r => r.role_name === 'super_admin')?.id, [roles]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSuccess = () => {
    setShowEditModal(false);
    setEditingUser(null);
    
    // CRITICAL FIX: Force reload user data after successful save
    console.log("[DEBUG] User save successful, refreshing user list...");
    loadData();
  };

  const loadData = async () => {
    console.log("[DB FETCH] Loading users, roles, and organizations...");
    setLoading(true);
    try {
      // Add small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const [userData, roleData, orgData] = await Promise.all([
        User.list('-created_date'),
        Role.list(),
        Organization.list()
      ]);
      
      console.log(`[DB SUCCESS] Loaded ${userData.length} users`);
      console.log("[DEBUG] First user:", userData[0]); // This will show if the name updated
      
      setUsers(userData);
      setRoles(roleData);
      setOrganizations(orgData);
      
    } catch (error) {
      console.error("[DB ERROR] Failed to load data:", error);
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        alert('Rate limit reached. Please wait 30 seconds and refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Are you sure you want to permanently delete ${userToDelete.full_name}? This action cannot be undone.`)) {
      console.log(`[DB DELETE] Attempting to delete user ID: ${userToDelete.id}`);
      try {
        await User.delete(userToDelete.id);
        console.log(`[DB COMMIT] User ID: ${userToDelete.id} deleted successfully.`);
        loadData();
      } catch (error) {
        console.error(`[DB ERROR] Failed to delete user ID: ${userToDelete.id}`, error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getOrgName = (orgId) => organizations.find(org => org.id === orgId)?.name || 'N/A';
  
  const roleColors = {
    super_admin: 'bg-red-100 text-red-800',
    platform_admin: 'bg-orange-100 text-orange-800',
    organization_admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    operator: 'bg-green-100 text-green-800',
    viewer: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            Global User Management
          </h1>
          <p className="text-slate-600 mt-1">View and manage all users across all organizations</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map(user => {
                  const userRole = roleMap[user.role_id];
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {userRole?.is_platform_role ? <span className="text-red-500 font-semibold">Platform</span> : getOrgName(user.organization_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {userRole && <Badge className={roleColors[userRole.role_name] || 'bg-gray-100 text-gray-800'}>
                          {userRole.role_display_name}
                        </Badge>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(user.created_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingUser(user); setShowEditModal(true); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Manage User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              disabled={user.role_id === superAdminRoleId}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => { setEditingUser(null); setShowEditModal(false); }}
          onSuccess={handleSuccess}
          organizations={organizations}
          roles={roles}
          superAdminRoleId={superAdminRoleId}
        />
      )}
    </div>
  );
}