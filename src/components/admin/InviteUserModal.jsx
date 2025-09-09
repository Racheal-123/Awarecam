import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Mail, ShieldCheck } from 'lucide-react';
import SecureInvitationInfoModal from '@/components/admin/SecureInvitationInfoModal';

export default function InviteUserModal({ onClose, organizations = [], roles = [] }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [title, setTitle] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const selectedRole = roles.find(r => r.id === roleId);
  const isPlatformRole = selectedRole?.is_platform_role;

  const handleShowInviteSteps = (e) => {
    e.preventDefault();
    setShowInfoModal(true);
  };
  
  if (showInfoModal) {
    return (
      <SecureInvitationInfoModal 
        userEmail={email}
        userName={fullName}
        onClose={() => {
          setShowInfoModal(false);
          onClose(); // Close both modals
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900">Invite New User</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleShowInviteSteps} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <Input 
              type="text"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Enter full name"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter email address"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <select 
              value={roleId} 
              onChange={(e) => setRoleId(e.target.value)} 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.role_display_name} {role.is_platform_role ? '(Platform)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {!isPlatformRole && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization *</label>
              <select 
                value={organizationId} 
                onChange={(e) => setOrganizationId(e.target.value)} 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
              >
                <option value="">Select an organization...</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <Input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Job title (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Mail className="w-4 h-4 mr-2" />
              Show Invitation Steps
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}