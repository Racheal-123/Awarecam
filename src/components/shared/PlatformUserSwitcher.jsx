
import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  UserCog,
  ChevronDown,
  Users
} from 'lucide-react';

const platformUsers = [
  {
    id: 'super_admin',
    email: 'super.admin@awarecam.com',
    full_name: 'Super Admin (Platform)',
    role: 'platform_admin',
    icon: Crown,
    color: 'bg-red-100 text-red-800',
    description: 'Full platform control'
  },
  {
    id: 'admin',
    email: 'admin@awarecam.com', 
    full_name: 'Admin (Platform)',
    role: 'admin',
    icon: UserCog,
    color: 'bg-orange-100 text-orange-800',
    description: 'Administrative access'
  }
];

export default function PlatformUserSwitcher({ currentUser, onUserChange }) {
  // The component is now "controlled" by the parent. It doesn't hold its own state.
  const selectedUser = platformUsers.find(u => u.role === currentUser?.role) || platformUsers[0];

  const handleUserSelect = (user) => {
    // It only notifies the parent of the change.
    onUserChange(user);
  };

  const IconComponent = selectedUser.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-600 bg-slate-800/50"
        >
          <IconComponent className="w-4 h-4 mr-2" />
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{selectedUser.full_name}</span>
            <span className="text-xs text-slate-400 truncate">{selectedUser.email}</span>
          </div>
          <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Switch Platform View
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {platformUsers.map((user) => {
          const UserIcon = user.icon;
          const isSelected = selectedUser.id === user.id;
          
          return (
            <DropdownMenuItem 
              key={user.id}
              onSelect={() => handleUserSelect(user)}
              className={`p-4 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{user.full_name}</span>
                    {isSelected && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{user.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
            <Crown className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-700">
              Switch views to see how the platform appears to different admin roles.
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
