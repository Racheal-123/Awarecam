import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '@/api/entities';

export default function EditUserModal({ user, onClose, onSuccess, organizations, roles, superAdminRoleId }) {
  const isSuperAdmin = user?.role_id === superAdminRoleId;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    role_id: user?.role_id || '',
    organization_id: user?.organization_id || '',
    title: user?.title || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const selectedRole = roles.find(r => r.id === formData.role_id);
  const isPlatformRole = selectedRole?.is_platform_role;

  useEffect(() => {
    if (isPlatformRole) {
      setFormData(f => ({ ...f, organization_id: '' }));
    }
  }, [isPlatformRole]);

  // If this is a Super Admin, show read-only info instead of editable form
  if (isSuperAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">App Creator Profile</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Protected System Account</p>
                <p className="text-sm text-blue-700">This account cannot be modified from within the application for security reasons.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  {user.full_name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  {user.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  Super Administrator (Platform)
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900">To modify this profile:</p>
                  <p className="text-amber-800 mt-1">
                    Go to your main Base44 workspace dashboard and update your account settings there.
                  </p>
                </div>
              </div>
            </div>
            
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.role_id) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (!isPlatformRole && !formData.organization_id) {
      setError('Please select an organization for this role.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const dataToSave = {
      full_name: formData.full_name,
      email: formData.email,
      role_id: formData.role_id,
      title: formData.title,
      organization_id: isPlatformRole ? null : formData.organization_id,
    };

    console.log(`[DEBUG] Updating user ${user.id} with data:`, dataToSave);

    try {
      await User.update(user.id, dataToSave);
      console.log(`[SUCCESS] User ${user.id} updated successfully`);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
      
    } catch (err) {
      console.error("[ERROR] Failed to save user:", err);
      setError(`Failed to save user: ${err.message || 'Please try again.'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900">Edit User</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <Input 
              type="text"
              value={formData.full_name} 
              onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              placeholder="Enter full name"
              required 
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="Enter email address"
              required 
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <select 
              value={formData.role_id} 
              onChange={(e) => setFormData({...formData, role_id: e.target.value})} 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required 
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.role_display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Organization {!isPlatformRole && '*'}
            </label>
            <select 
              value={formData.organization_id || ''} 
              onChange={(e) => setFormData({...formData, organization_id: e.target.value})} 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required={!isPlatformRole} 
              disabled={isPlatformRole}
            >
              {isPlatformRole ? (
                <option value="">N/A - Platform Level Role</option>
              ) : (
                <>
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title (Optional)</label>
            <Input 
              type="text"
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              placeholder="Enter job title"
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">User updated successfully!</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}