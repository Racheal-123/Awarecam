import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Search, ListChecks } from 'lucide-react';

export default function UsageGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500"/>
            How to Use the AI Assistant
        </CardTitle>
        <CardDescription>
          Get the most out of your AI-powered search and analysis tool.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <Search className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold">Ask Specific Questions</h4>
            <p className="text-slate-600">
              The more specific your question, the better the answer. Instead of "any alerts?", try "show me critical intrusion alerts from last night."
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ListChecks className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold">Query Events and Tasks</h4>
            <p className="text-slate-600">
              You can ask about your operational data. For example: "How many tasks are overdue?" or "List all safety violations this week."
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
            <p className="text-xs text-slate-500 pl-11">
                The assistant will provide a summary and a "View Details" link to see the full, filtered list in the app.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}