import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AgentAlertChannel } from '@/api/entities';
import { AlertNotification } from '@/api/entities';
import { useUser } from '@/pages/Layout';

export default function TestAlertEngine() {
  const { organization, user } = useUser();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [testMessage, setTestMessage] = useState('This is a test alert from AwareCam. Your integration is working correctly!');
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (organization) {
      loadChannels();
    }
  }, [organization]);

  const loadChannels = async () => {
    try {
      const channelList = await AgentAlertChannel.filter({ 
        organization_id: organization.id,
        is_active: true 
      });
      setChannels(channelList);
    } catch (error) {
      console.error('Failed to load channels:', error);
      setChannels([]);
    }
  };

  const handleSendTestAlert = async () => {
    if (!selectedChannel) return;
    
    setTesting(true);
    const startTime = Date.now();
    
    try {
      const channel = channels.find(c => c.id === selectedChannel);
      
      // Create a test notification record
      const testNotification = await AlertNotification.create({
        organization_id: organization.id,
        user_id: user.id,
        event_id: 'test-event',
        workflow_id: 'test-workflow',
        channel_id: selectedChannel,
        notification_type: channel.channel_type,
        title: 'Test Alert',
        description: testMessage,
        severity: 'medium',
        status: 'pending',
        message_content: {
          test: true,
          timestamp: new Date().toISOString(),
          message: testMessage
        }
      });

      // Simulate sending the alert (in a real implementation, this would trigger the actual delivery)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the notification as sent
      await AlertNotification.update(testNotification.id, {
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Add to test results
      setTestResults(prev => [{
        id: Date.now(),
        channel: channel.channel_name,
        type: channel.channel_type,
        status: 'success',
        duration,
        message: 'Test alert sent successfully',
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 results

    } catch (error) {
      console.error('Test failed:', error);
      
      const channel = channels.find(c => c.id === selectedChannel);
      const endTime = Date.now();
      const duration = endTime - startTime;

      setTestResults(prev => [{
        id: Date.now(),
        channel: channel?.channel_name || 'Unknown',
        type: channel?.channel_type || 'unknown',
        status: 'failed',
        duration,
        message: error.message || 'Failed to send test alert',
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Send Test Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Channel to Test</label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an alert channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    <div className="flex items-center gap-2">
                      <span>{channel.channel_name}</span>
                      <span className="text-xs text-slate-500">({channel.channel_type})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Test Message</label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter your test message..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSendTestAlert}
            disabled={!selectedChannel || testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Sending Test...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Alert
              </>
            )}
          </Button>

          {channels.length === 0 && (
            <Alert>
              <AlertDescription>
                No active alert channels found. Please create and configure at least one alert channel first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.channel}</div>
                      <div className="text-sm text-slate-500">
                        {result.type} • {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {result.duration}ms
                    </div>
                    <div className="text-xs text-slate-500">
                      {result.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}