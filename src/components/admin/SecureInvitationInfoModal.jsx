import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ShieldCheck, Mail } from 'lucide-react';

export default function SecureInvitationInfoModal({ onClose, userEmail, userName }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Invitation Required</h2>
        <p className="text-slate-600 mb-6">
          To protect your application's security, new users must be invited from your main Base44 dashboard.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-left space-y-4">
          <h3 className="font-semibold text-lg">To invite {userName}, follow these steps:</h3>
          <ol className="list-decimal list-inside space-y-3 text-slate-700">
            <li>
              <strong>Go to your Base44 Workspace:</strong> Open the main dashboard where you manage your apps.
            </li>
            <li>
              <strong>Navigate to User Management:</strong> Select this app ("AwareCam") and go to the "Users" or "Team" section.
            </li>
            <li>
              <strong>Click "Invite User":</strong> Use the platform's official invitation feature.
            </li>
            <li>
              <strong>Enter User's Email:</strong>
              <div className="mt-2 flex items-center gap-2 p-2 bg-white border rounded-md">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="font-mono text-blue-700">{userEmail}</span>
              </div>
            </li>
          </ol>
        </div>
        
        <Button onClick={onClose} className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
          I Understand
        </Button>
      </div>
    </div>
  );
}