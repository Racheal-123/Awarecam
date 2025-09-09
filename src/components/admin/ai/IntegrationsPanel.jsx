import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ExternalLink } from 'lucide-react';

export default function IntegrationsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI & Analytics Integrations</CardTitle>
        <CardDescription>
          Connect third-party services to enhance the AI assistant's capabilities or export data for deeper analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Connect your OpenAI Account</h4>
              <p className="text-sm text-slate-600">Bring your own model for custom fine-tuning and advanced features.</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 sm:mt-0">
            Connect <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}