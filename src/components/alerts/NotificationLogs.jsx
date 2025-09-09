import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { AlertNotification } from '@/api/entities';
import { useUser } from '@/pages/Layout';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationLogs() {
  const { organization } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (organization) {
      loadNotifications();
    }
  }, [organization]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notificationList = await AlertNotification.filter(
        { organization_id: organization.id },
        '-created_date',
        100
      );
      setNotifications(notificationList);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.notification_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'skipped':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Title', 'Type', 'Status', 'Severity', 'Description'].join(','),
      ...filteredNotifications.map(n => [
        new Date(n.created_date).toLocaleString(),
        n.title,
        n.notification_type,
        n.status,
        n.severity,
        n.description
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-slate-500">Loading notification logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="in_app">In-App</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Notification History ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No notifications found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                        <Badge className={getSeverityColor(notification.severity)}>
                          {notification.severity}
                        </Badge>
                        <Badge variant="outline">
                          {notification.notification_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.description}
                      </p>
                      <div className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                        {notification.sent_at && notification.sent_at !== notification.created_date && (
                          <span> • Sent {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}</span>
                        )}
                        {notification.delivery_error && (
                          <span className="text-red-600"> • Error: {notification.delivery_error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}