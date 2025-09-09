import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertWorkflow } from '@/api/entities';
import { useUser } from '@/pages/Layout';
import BotFlowBuilder from '@/components/bots/BotFlowBuilder';
import { Loader2, Save } from 'lucide-react';

export default function BotFlowBuilderModal({ bot, onClose }) {
    const { organization } = useUser();
    const [workflow, setWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadWorkflow();
    }, [bot, organization]);

    const loadWorkflow = async () => {
        if (!bot || !organization) return;
        setLoading(true);
        try {
            const existingWorkflows = await AlertWorkflow.filter({
                organization_id: organization.id,
                triggering_agent_id: bot.id,
            });

            if (existingWorkflows.length > 0) {
                setWorkflow(existingWorkflows[0]);
            } else {
                setWorkflow({
                    organization_id: organization.id,
                    triggering_agent_id: bot.id,
                    workflow_name: `${bot.display_name} Default Flow`,
                    escalation_policy: [{ delay_minutes: 0, channel_ids: [] }],
                    is_active: true,
                });
            }
        } catch (error) {
            console.error('Failed to load workflow:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (workflow.id) {
                await AlertWorkflow.update(workflow.id, workflow);
            } else {
                await AlertWorkflow.create(workflow);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save workflow:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Configure Bot Automation Flow: {bot.display_name}</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}
                    {!loading && workflow && (
                        <BotFlowBuilder
                            bot={bot}
                            workflow={workflow}
                            onWorkflowChange={setWorkflow}
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Flow
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}