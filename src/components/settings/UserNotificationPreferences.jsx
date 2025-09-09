import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  Info
} from 'lucide-react';
import { UserNotificationPreferences as UserNotificationPreferencesEntity } from '@/api/entities';
import { AgentAlertChannel } from '@/api/entities';
import { User } from '@/api/entities';
import { useUser } from '@/pages/Layout';

const CHANNEL_TYPE_LABELS = {
  email: 'Email Notifications',
  whatsapp: 'WhatsApp Messages',
  webhook: 'Webhook Alerts',
  sms: 'SMS Messages',
  slack: 'Slack Messages',
  telegram: 'Telegram Messages',
  iot_device: 'IoT Device Alerts',
  zapier: 'Zapier Automation'
};

const CHANNEL_TYPE_DESCRIPTIONS = {
  email: 'Receive alerts via email',
  whatsapp: 'Get notifications on WhatsApp',
  webhook: 'Send alerts to your webhook endpoint',
  sms: 'Receive SMS text messages',
  slack: 'Get notified in Slack channels',
  telegram: 'Receive Telegram messages',
  iot_device: 'Trigger IoT devices and displays',
  zapier: 'Trigger Zapier automations'
};

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low Priority', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical Priority', color: 'bg-red-100 text-red-800' }
];

export default function UserNotificationPreferences() {
  const { user, organization } = useUser();
  const [preferences, setPreferences] = useState(null);
  const [availableChannels, setAvailableChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDndWindow, setNewDndWindow] = useState({
    start_time: '22:00',
    end_time: '08:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });

  useEffect(() => {
    if (user && organization) {
      loadPreferences();
    }
  }, [user, organization]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Load user's existing preferences
      const existingPrefs = await UserNotificationPreferencesEntity.filter({
        user_id: user.id,
        organization_id: organization.id
      });
      
      // Load available channels for this organization
      const channels = await AgentAlertChannel.filter({
        organization_id: organization.id,
        is_active: true
      });
      
      setAvailableChannels(channels);
      
      if (existingPrefs.length > 0) {
        setPreferences(existingPrefs[0]);
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          organization_id: organization.id,
          preferred_channels: ['email'],
          blocked_channels: [],
          mute_alerts: false,
          do_not_disturb_windows: [],
          override_org_routing: false,
          severity_threshold: 'medium'
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (preferences.id) {
        await UserNotificationPreferencesEntity.update(preferences.id, preferences);
      } else {
        await UserNotificationPreferencesEntity.create(preferences);
      }
      
      // Reload to get the updated record
      await loadPreferences();
      
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleChannelPreference = (channelType, isPreferred) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      
      if (isPreferred) {
        // Add to preferred, remove from blocked
        newPrefs.preferred_channels = [...(prev.preferred_channels || []), channelType];
        newPrefs.blocked_channels = (prev.blocked_channels || []).filter(c => c !== channelType);
      } else {
        // Remove from preferred, add to blocked
        newPrefs.preferred_channels = (prev.preferred_channels || []).filter(c => c !== channelType);
        newPrefs.blocked_channels = [...(prev.blocked_channels || []), channelType];
      }
      
      return newPrefs;
    });
  };

  const addDndWindow = () => {
    setPreferences(prev => ({
      ...prev,
      do_not_disturb_windows: [
        ...(prev.do_not_disturb_windows || []),
        { ...newDndWindow }
      ]
    }));
    
    // Reset form
    setNewDndWindow({
      start_time: '22:00',
      end_time: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });
  };

  const removeDndWindow = (index) => {
    setPreferences(prev => ({
      ...prev,
      do_not_disturb_windows: (prev.do_not_disturb_windows || []).filter((_, i) => i !== index)
    }));
  };

  const getAvailableChannelTypes = () => {
    const orgChannelTypes = availableChannels.map(ch => ch.channel_type);
    return [...new Set(orgChannelTypes)]; // Remove duplicates
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading notification preferences...
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <BellOff className="w-8 h-8 text-slate-400 mr-3" />
          <div>
            <h3 className="font-medium text-slate-900">No Preferences Found</h3>
            <p className="text-sm text-slate-600">Unable to load your notification preferences.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you receive alerts from AwareCam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mute All Alerts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="font-medium">Mute All Alerts</Label>
              <p className="text-sm text-slate-600">
                Temporarily disable all notifications (emergency alerts may still come through)
              </p>
            </div>
            <Switch
              checked={preferences.mute_alerts || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, mute_alerts: checked }))
              }
            />
          </div>

          {/* Override Organization Routing */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="font-medium">Override Organization Settings</Label>
              <p className="text-sm text-slate-600">
                Use your personal preferences instead of organization-wide alert routing
              </p>
            </div>
            <Switch
              checked={preferences.override_org_routing || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, override_org_routing: checked }))
              }
            />
          </div>

          {/* Minimum Severity Threshold */}
          <div className="space-y-3">
            <Label className="font-medium">Minimum Alert Severity</Label>
            <p className="text-sm text-slate-600">
              Only receive notifications for alerts at or above this severity level
            </p>
            <div className="flex gap-2 flex-wrap">
              {SEVERITY_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setPreferences(prev => ({ 
                    ...prev, 
                    severity_threshold: level.value 
                  }))}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    preferences.severity_threshold === level.value
                      ? level.color + ' border-current'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose which channels you want to receive notifications through.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {getAvailableChannelTypes().map(channelType => {
            const isPreferred = (preferences.preferred_channels || []).includes(channelType);
            const isBlocked = (preferences.blocked_channels || []).includes(channelType);
            const channelCount = availableChannels.filter(ch => ch.channel_type === channelType).length;
            
            return (
              <div key={channelType} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">
                      {CHANNEL_TYPE_LABELS[channelType] || channelType}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {channelCount} configured
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {CHANNEL_TYPE_DESCRIPTIONS[channelType] || 'Receive notifications via this channel'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isPreferred && !isBlocked}
                    onCheckedChange={(checked) => toggleChannelPreference(channelType, checked)}
                  />
                </div>
              </div>
            );
          })}
          
          {getAvailableChannelTypes().length === 0 && (
            <div className="text-center py-8">
              <BellOff className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900 mb-1">No Channels Available</h3>
              <p className="text-sm text-slate-600">
                Your organization hasn't configured any notification channels yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Do Not Disturb Windows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Do Not Disturb
          </CardTitle>
          <CardDescription>
            Set quiet hours when you don't want to receive non-critical notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing DND Windows */}
          {(preferences.do_not_disturb_windows || []).map((window, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">
                  {window.start_time} - {window.end_time}
                </div>
                <div className="text-sm text-slate-600">
                  {window.days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDndWindow(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* Add New DND Window */}
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Time</Label>
                <Input
                  type="time"
                  value={newDndWindow.start_time}
                  onChange={(e) => setNewDndWindow(prev => ({
                    ...prev,
                    start_time: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Time</Label>
                <Input
                  type="time"
                  value={newDndWindow.end_time}
                  onChange={(e) => setNewDndWindow(prev => ({
                    ...prev,
                    end_time: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Days</Label>
              <div className="flex gap-2 flex-wrap">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      const isSelected = newDndWindow.days.includes(day);
                      setNewDndWindow(prev => ({
                        ...prev,
                        days: isSelected 
                          ? prev.days.filter(d => d !== day)
                          : [...prev.days, day]
                      }));
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      newDndWindow.days.includes(day)
                        ? 'bg-blue-100 text-blue-800 border-blue-200 border'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={addDndWindow} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Quiet Hours
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}