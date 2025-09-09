
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Users as UsersIcon,
  Mail,
  ShieldCheck,
  Briefcase,
  Edit,
  Trash2,
  UserX,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';

import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import InviteUserModal from '@/components/users/InviteUserModal';
import EditUserModal from '@/components/users/EditUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUserData = await User.me();
      setCurrentUser(currentUserData);

      // Get organization context from URL params
      const params = new URLSearchParams(window.location.search);
      const orgId = params.get('org_id');
      
      let targetOrgId = orgId;
      if (!orgId && currentUserData.role !== 'admin' && currentUserData.role !== 'platform_admin') {
        const orgs = await Organization.list();
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
          targetOrgId = orgs[0].id;
        }
      } else if (orgId) {
        const orgData = await Organization.get(orgId);
        setOrganization(orgData);
      }

      if (targetOrgId) {
        // Load existing users for the organization
        const userList = await User.filter({ organization_id: targetOrgId });
        setUsers(userList);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    loadData();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleToggleUserStatus = async (user) => {
    try {
      await User.update(user.id, { is_active: !user.is_active });
      loadData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`)) {
      try {
        await User.delete(user.id);
        loadData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    organization_admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    operator: 'bg-green-100 text-green-800',
    viewer: 'bg-slate-100 text-slate-800'
  };

  const roleLabels = {
    organization_admin: 'Admin',
    manager: 'Manager',
    operator: 'Operator',
    viewer: 'Viewer'
  };
  
  const canManageUsers = currentUser?.role === 'organization_admin' || 
    (currentUser?.role === 'admin' || currentUser?.role === 'platform_admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Manage users and permissions for {organization?.name}</p>
        </div>
        {canManageUsers && (
          <Button onClick={() => setShowInviteModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{users.length}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-green-900">{users.filter(u => u.is_active).length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Admins</p>
                <p className="text-3xl font-bold text-purple-900">{users.filter(u => u.role === 'organization_admin').length}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-700 text-sm font-medium">Pending Invites</p>
                <p className="text-3xl font-bold text-amber-900">0</p>
              </div>
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No Users Found</h3>
            <p className="text-slate-500 mt-2 mb-6">
              {users.length === 0 
                ? "Get started by inviting your first team member to this organization." 
                : "Try adjusting your search criteria."}
            </p>
            {canManageUsers && users.length === 0 && (
              <Button onClick={() => setShowInviteModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Invite First User
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.photo_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">{user.full_name}</p>
                        {!user.is_active && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                        {user.title && (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {user.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={roleColors[user.role] || roleColors.viewer}>
                      {user.role === 'organization_admin' ? <ShieldCheck className="w-3 h-3 mr-1.5" /> : <Briefcase className="w-3 h-3 mr-1.5" />}
                      {roleLabels[user.role] || 'Unknown'}
                    </Badge>
                    {canManageUsers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                            {user.is_active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteUserModal 
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInviteSuccess}
          organizationId={organization?.id}
        />
      )}

      {showEditModal && editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setEditingUser(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
