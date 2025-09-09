import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export default function BotFlowBuilder({ bot, workflow, onWorkflowChange }) {
    const handleAddStep = () => {
        const newStep = { delay_minutes: 0, channel_ids: [] };
        const updatedPolicy = [...(workflow.escalation_policy || []), newStep];
        onWorkflowChange({ ...workflow, escalation_policy: updatedPolicy });
    };

    const handleRemoveStep = (index) => {
        const updatedPolicy = (workflow.escalation_policy || []).filter((_, i) => i !== index);
        onWorkflowChange({ ...workflow, escalation_policy: updatedPolicy });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Bot Trigger Conditions</CardTitle>
                    <CardDescription>Define what events from this bot will start the workflow.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600">
                        This workflow is triggered by the <span className="font-medium text-blue-600">{bot.display_name}</span> bot.
                    </p>
                    <p className="text-sm mt-2">Future settings will allow for more granular control (e.g., severity, confidence).</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Automation Steps</CardTitle>
                    <CardDescription>Set up the sequence of notifications to be sent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(workflow.escalation_policy || []).map((step, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Step {index + 1}</span>
                                {index > 0 && <ArrowRight className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    After <span className="font-semibold">{step.delay_minutes} minutes</span>, notify via selected channels.
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveStep(index)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={handleAddStep}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Escalation Step
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}