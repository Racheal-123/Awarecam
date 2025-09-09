import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AIValidationStepView({ step }) {
    return (
        <div className="max-w-2xl mx-auto text-center">
             <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-slate-600 mb-6">{step.description}</p>
            <div className="p-8 bg-blue-50 rounded-lg border border-blue-200">
                <Sparkles className="mx-auto h-12 w-12 text-blue-400" />
                <h3 className="mt-2 text-lg font-medium text-blue-900">AI Validation In Progress</h3>
                <div className="mt-6">
                    <Badge className="bg-blue-200 text-blue-800 text-base py-2 px-4">
                        Pending AI Confirmation
                    </Badge>
                    <p className="text-xs text-slate-500 mt-2">This step will be completed automatically by the AI system once the conditions are met.</p>
                </div>
            </div>
        </div>
    );
}