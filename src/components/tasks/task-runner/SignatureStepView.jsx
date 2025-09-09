import React from 'react';
import { PenSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SignatureStepView({ step, updateStepData }) {
    const existingEvidence = step.evidence?.find(e => e.type === 'signature');

    const handleSign = () => {
        // In a real app, this would open a signature pad modal.
        // For now, we'll just mark it as complete with a placeholder.
        updateStepData({
            status: 'completed',
            evidence: [{ type: 'signature', value: `signed_by_user_at_${new Date().toISOString()}`, timestamp: new Date().toISOString() }]
        });
        toast.info("Signature captured (placeholder).");
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-slate-600 mb-6">{step.description}</p>
            <div className="p-8 border-2 border-dashed rounded-lg bg-white">
                <PenSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Signature Required</h3>
                <p className="mt-1 text-sm text-gray-500">Please provide a signature to complete this step.</p>
                <div className="mt-6">
                    {existingEvidence ? (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                            <CheckCircle className="w-6 h-6" />
                            <span>Signature Captured</span>
                        </div>
                    ) : (
                         <Button onClick={handleSign}>
                            Tap to Sign
                        </Button>
                    )}
                    <p className="text-xs text-slate-500 mt-2">Note: Full signature pad functionality is a premium feature.</p>
                </div>
            </div>
        </div>
    );
}