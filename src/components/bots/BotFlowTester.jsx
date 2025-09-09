import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Zap, Send, Loader2 } from 'lucide-react';
import { createEventWithAlerts } from '@/components/services/EventService';
import { useUser } from '@/pages/Layout';

export default function BotFlowTester({ bot }) {
    const { organization } = useUser();
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);

        const testEvent = {
            organization_id: organization.id,
            camera_id: 'test-camera-123',
            camera_name: 'Test Camera',
            event_type: 'person_detected',
            severity: 'high',
            confidence: 0.95,
            description: `Test event for bot: ${bot.display_name}`,
            status: 'new',
            ai_agent: bot.display_name, // Match bot name
        };

        try {
            await createEventWithAlerts(testEvent);
            setTestResult({ success: true, message: 'Test event sent. Check your configured notification channels.' });
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to send test event.' });
            console.error('Test event failed:', error);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Bot Flow
                </CardTitle>
                <CardDescription>
                    Send a sample high-priority event to test this bot's alert workflow.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleTest} disabled={isTesting} className="w-full">
                    {isTesting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Test Alert
                </Button>
                {testResult && (
                    <div className={`p-3 rounded-md text-sm ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResult.message}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}