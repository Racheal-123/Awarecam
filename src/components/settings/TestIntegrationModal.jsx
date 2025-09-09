import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AgentAlertChannel } from '@/api/entities';
import { AlertNotification } from '@/api/entities';
import { useUser } from '@/pages/Layout';

const testScenarios = {
  motion_detected: {
    event_type: 'motion_detected',
    severity: 'medium',
    description: 'Motion detected in restricted area',
    camera_name: 'Front Entrance Camera',
    zone_name: 'Entrance Zone',
    confidence: 0.92
  },
  ppe_violation: {
    event_type: 'ppe_compliance_violation',
    severity: 'high', 
    description: 'Worker without safety helmet detected',
    camera_name: 'Construction Site Cam 1',
    zone_name: 'Work Area A',
    confidence: 0.87
  },
  fire_alarm: {
    event_type: 'fire_smoke_detected',
    severity: 'critical',
    description: 'Smoke detected in server room',
    camera_name: 'Server Room Camera',
    zone_name: 'Server Room',
    confidence: 0.95
  },
  intrusion: {
    event_type: 'intrusion_alert',
    severity: 'high',
    description: 'Unauthorized person detected after hours',
    camera_name: 'Perimeter Camera 3',
    zone_name: 'Restricted Area',
    confidence: 0.89
  }
};

export default function TestIntegrationModal({ channel, onComplete, onCancel }) {
  const { organization, user } = useUser();
  const [selectedScenario, setSelectedScenario] = useState('motion_detected');
  const [customMessage, setCustomMessage] = useState('This is a test notification from AwareCam. Your integration is working correctly!');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const scenario = testScenarios[selectedScenario];
      const testEventData = {
        ...scenario,
        timestamp: new Date().toISOString(),
        event_id: `test-${Date.now()}`,
        organization_name: organization.name,
        thumbnail_url: 'https://via.placeholder.com/640x480/0066cc/ffffff?text=Test+Event',
        video_url: 'https://via.placeholder.com/640x480/0066cc/ffffff?text=Test+Video'
      };

      // Create a test notification record
      const notification = await AlertNotification.create({
        organization_id: organization.id,
        user_id: user.id,
        event_id: testEventData.event_id,
        workflow_id: 'test-workflow',
        channel_id: channel.id,
        notification_type: channel.channel_type,
        title: `Test Alert - ${scenario.event_type.replace('_', ' ')}`,
        description: customMessage,
        severity: scenario.severity,
        status: 'pending',
        message_content: {
          test: true,
          scenario: selectedScenario,
          ...testEventData,
          custom_message: customMessage
        }
      });

      // Simulate sending the notification
      // In a real implementation, this would trigger the actual delivery mechanism
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the channel test status
      await AgentAlertChannel.update(channel.id, {
        test_status: 'success',
        last_test_date: new Date().toISOString()
      });

      // Update notification as sent
      await AlertNotification.update(notification.id, {
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      setTestResult({
        status: 'success',
        message: 'Test notification sent successfully! Check your integration endpoint to verify receipt.'
      });

    } catch (error) {
      console.error('Test failed:', error);
      
      // Update the channel test status as failed
      await AgentAlertChannel.update(channel.id, {
        test_status: 'failed',
        last_test_date: new Date().toISOString()
      });

      setTestResult({
        status: 'error',
        message: `Test failed: ${error.message || 'Unknown error occurred'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const getScenarioDescription = (scenarioKey) => {
    const scenario = testScenarios[scenarioKey];
    return `${scenario.event_type.replace('_', ' ')} (${scenario.severity})`;
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Integration: {channel.channel_name}
          </DialogTitle>
          <DialogDescription>
            Send a test notification to verify your {channel.channel_type} integration is working correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Scenario Selection */}
          <div>
            <Label htmlFor="scenario">Test Scenario</Label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(testScenarios).map(key => (
                  <SelectItem key={key} value={key}>
                    {getScenarioDescription(key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div>
            <Label htmlFor="message">Custom Message</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a custom test message..."
              rows={3}
            />
          </div>

          {/* Test Payload Preview */}
          <div>
            <Label>Test Payload Preview</Label>
            <div className="bg-slate-50 p-3 rounded-lg border">
              <pre className="text-xs text-slate-700 overflow-x-auto">
{JSON.stringify({
  ...testScenarios[selectedScenario],
  timestamp: new Date().toISOString(),
  organization_name: organization.name,
  custom_message: customMessage
}, null, 2)}
              </pre>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult.status === 'success' ? 'default' : 'destructive'}>
              {testResult.status === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Integration-specific notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> 
              {channel.channel_type === 'webhook' && ' Check your server logs or webhook endpoint for the test payload.'}
              {channel.channel_type === 'slack' && ' Look for the test message in your configured Slack channel.'}
              {channel.channel_type === 'teams' && ' Check your Teams channel for the test notification.'}
              {channel.channel_type === 'twilio_sms' && ' The test SMS will be sent to your configured phone numbers.'}
              {channel.channel_type === 'whatsapp' && ' Check WhatsApp on your configured numbers for the test message.'}
              {channel.channel_type === 'sendgrid_email' && ' Check the inbox of your configured email addresses.'}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
            <Button onClick={handleSendTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}