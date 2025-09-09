import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import SecureInvitationInfoModal from '@/components/admin/SecureInvitationInfoModal';

export default function OrgInviteUserModal({ onClose, onInviteSuccess, organizationId, organizationName }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('operator');
  const [title, setTitle] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleSubmit = (e) => {
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
          onInviteSuccess();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900">Invite User to {organizationName}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Jane Smith"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., jane.smith@company.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Job Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Security Manager"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organization_admin">Organization Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Show Invitation Steps
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}