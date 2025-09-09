import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Info } from 'lucide-react';
import { User } from '@/api/entities';
import { UserNotificationSettings } from '@/api/entities';

export default function NotificationSettingsPanel() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const initializeSettings = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                
                const existingSettings = await UserNotificationSettings.filter({ user_id: user.id });

                if (existingSettings.length > 0) {
                    setSettings(existingSettings[0]);
                } else {
                    // Auto-create settings if they don't exist
                    const newSettings = await UserNotificationSettings.create({
                        user_id: user.id,
                        organization_id: user.organization_id,
                        email_enabled: true,
                        in_app_enabled: true,
                    });
                    setSettings(newSettings);
                }
            } catch (error) {
                console.error("Error initializing notification settings:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeSettings();
    }, []);

    const handleToggle = async (key, value) => {
        if (!settings) return;

        // Optimistic UI update
        const oldSettings = { ...settings };
        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);

        try {
            await UserNotificationSettings.update(settings.id, { [key]: value });
        } catch (error) {
            console.error(`Failed to update setting ${key}:`, error);
            // Revert on error
            setSettings(oldSettings);
        }
    };
    
    const isManager = currentUser?.role === 'organization_admin' || currentUser?.role === 'manager';

    if (loading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
    }

    if (!settings) {
        return <div className="p-8 text-center text-slate-500">Could not load notification settings.</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive alerts and notifications from the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <Label htmlFor="email_enabled" className="font-semibold">Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive alerts and summaries via email.</p>
                    </div>
                    <Switch
                        id="email_enabled"
                        checked={settings.email_enabled}
                        onCheckedChange={(value) => handleToggle('email_enabled', value)}
                    />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <Label htmlFor="in_app_enabled" className="font-semibold">In-App Alerts</Label>
                        <p className="text-sm text-slate-500">Show alert popups and badge counters inside the application.</p>
                    </div>
                    <Switch
                        id="in_app_enabled"
                        checked={settings.in_app_enabled}
                        onCheckedChange={(value) => handleToggle('in_app_enabled', value)}
                    />
                </div>
                
                {isManager && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                        <div>
                            <Label htmlFor="override_by_agent" className="font-semibold">Agent-Specific Rules</Label>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Allow custom notification rules per agent to override these global settings.
                            </p>
                        </div>
                        <Switch
                            id="override_by_agent"
                            checked={settings.override_by_agent}
                            onCheckedChange={(value) => handleToggle('override_by_agent', value)}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}