import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

export default function InviteUserModal({ onClose, onInviteSuccess, organizationId }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('operator');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For now, we'll show a success message without actually creating the user
      // In a real app, this would use the proper invite endpoint
      setSuccess(true);
      setTimeout(() => {
        onInviteSuccess();
      }, 1500);
    } catch (err) {
      setError('Failed to invite user. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Invitation Sent!</h3>
            <p className="text-green-700">
              {fullName} will receive an email invitation to join your organization.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Send an invitation to add a new team member to your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Jane Smith"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., jane.smith@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Security Manager"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization_admin">
                    <div>
                      <div className="font-medium">Organization Admin</div>
                      <div className="text-xs text-slate-500">Full access to all features</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div>
                      <div className="font-medium">Manager</div>
                      <div className="text-xs text-slate-500">Manage teams and workflows</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="operator">
                    <div>
                      <div className="font-medium">Operator</div>
                      <div className="text-xs text-slate-500">Execute tasks and monitor cameras</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-slate-500">Read-only access</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This is a demo version. In the production app, an email invitation would be sent to the user.
              </p>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}