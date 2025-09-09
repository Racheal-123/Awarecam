import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, Zap, MessageSquare, Link as LinkIcon } from 'lucide-react';

import AlertWorkflows from '@/components/alerts/AlertWorkflows'; // Re-using this component
import { AgentAlertChannel } from '@/api/entities';
import { MultiSelect } from '@/components/ui/multi-select'; // Assuming a multiselect component exists

export default function AlertManagementPanel({ organization, onUpdate }) {
    const [channels, setChannels] = useState([]);
    const [defaultChannelIds, setDefaultChannelIds] = useState(organization?.default_alert_channel_ids || []);
    const [allowOverrides, setAllowOverrides] = useState(organization?.allow_user_notification_overrides || true);

    useEffect(() => {
        const loadChannels = async () => {
            if (organization) {
                const channelData = await AgentAlertChannel.filter({ organization_id: organization.id });
                setChannels(channelData);
            }
        };
        loadChannels();
    }, [organization]);

    const handleSaveDefaults = () => {
        onUpdate({ 
            default_alert_channel_ids: defaultChannelIds,
            allow_user_notification_overrides: allowOverrides 
        });
    };
    
    const channelOptions = channels.map(c => ({ value: c.id, label: `${c.channel_name} (${c.channel_type})` }));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Organization-Wide Alert Settings</CardTitle>
                    <CardDescription>Set default behaviors for all alert workflows in your organization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label>Default Notification Channels</Label>
                        <p className="text-sm text-slate-500 mb-2">These channels will be pre-selected when creating a new alert workflow.</p>
                        <MultiSelect
                            options={channelOptions}
                            selected={defaultChannelIds}
                            onChange={setDefaultChannelIds}
                            placeholder="Select default channels..."
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="allow-overrides" className="font-semibold">Allow User Overrides</Label>
                            <p className="text-sm text-slate-500">Allow individual users to disable notifications in their personal settings.</p>
                        </div>
                        <Switch
                            id="allow-overrides"
                            checked={allowOverrides}
                            onCheckedChange={setAllowOverrides}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveDefaults}>Save Defaults</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alert Workflows</CardTitle>
                    <CardDescription>Manage all automated alert workflows for your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertWorkflows />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Connected Channels & Integrations</CardTitle>
                    <CardDescription>Connect AwareCam to other services. (Placeholders for future integrations)</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-1" disabled>
                        <Zap className="w-6 h-6 text-orange-500" />
                        <span>Connect Zapier</span>
                        <span className="text-xs text-slate-400">Coming Soon</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-1" disabled>
                        <MessageSquare className="w-6 h-6 text-green-500" />
                        <span>Enable WhatsApp</span>
                        <span className="text-xs text-slate-400">Coming Soon</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-1" disabled>
                        <LinkIcon className="w-6 h-6 text-blue-500" />
                        <span>Link IoT Device</span>
                        <span className="text-xs text-slate-400">Coming Soon</span>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}