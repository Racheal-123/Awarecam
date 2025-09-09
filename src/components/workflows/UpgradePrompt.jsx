import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Crown } from 'lucide-react';

export default function UpgradePrompt() {
  return (
    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white">
      <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
        <Crown className="text-white w-5 h-5" />
        Unlock Workflow Automation
      </h4>
      <p className="text-sm text-purple-100 mb-4">
        Streamline operations with intelligent task management, camera validation, and team performance tracking.
      </p>
      <Button className="w-full bg-white text-purple-600 hover:bg-purple-50 font-medium">
        Contact Sales Team
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}