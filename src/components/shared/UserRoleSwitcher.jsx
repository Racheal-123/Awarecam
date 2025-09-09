import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, HardHat, Eye } from 'lucide-react';

const roleIcons = {
  organization_admin: <Users className="w-4 h-4 text-purple-500" />,
  manager: <Shield className="w-4 h-4 text-blue-500" />,
  operator: <HardHat className="w-4 h-4 text-green-500" />,
  viewer: <Eye className="w-4 h-4 text-slate-500" />,
};

const roleNames = {
  organization_admin: 'Org Admin',
  manager: 'Manager',
  operator: 'Operator',
  viewer: 'Viewer',
};

export default function UserRoleSwitcher({ currentRole, onRoleChange, isCollapsed }) {
  if (!currentRole) return null;
  
  const currentRoleName = roleNames[currentRole] || 'User';

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800 mx-auto">
        {roleIcons[currentRole]}
      </div>
    );
  }

  return (
    <Select value={currentRole} onValueChange={onRoleChange}>
      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
        <SelectValue placeholder="Switch Role View" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="organization_admin">
          <div className="flex items-center gap-2">
            {roleIcons.organization_admin} Organization Admin
          </div>
        </SelectItem>
        <SelectItem value="manager">
          <div className="flex items-center gap-2">
            {roleIcons.manager} Manager
          </div>
        </SelectItem>
        <SelectItem value="operator">
          <div className="flex items-center gap-2">
            {roleIcons.operator} Operator
          </div>
        </SelectItem>
        <SelectItem value="viewer">
          <div className="flex items-center gap-2">
            {roleIcons.viewer} Viewer
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}