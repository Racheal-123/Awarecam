import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Bell, Check, AlertTriangle, Shield, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AlertNotification } from '@/api/entities';
import { User } from '@/api/entities';
import { useUser } from '@/layout';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  high: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  medium: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
  low: { icon: Shield, color: 'text-slate-500', bg: 'bg-slate-50' },
};

export default function AlertsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const userNotifications = await AlertNotification.filter({ user_id: user.id }, '-created_date', 100);
            setNotifications(userNotifications);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            // This assumes a bulk update is possible. If not, loop and update one by one.
            await Promise.all(unreadIds.map(id => AlertNotification.update(id, { is_read: true, read_at: new Date().toISOString() })));
            loadNotifications(); // Refresh list
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await AlertNotification.update(notificationId, { is_read: true, read_at: new Date().toISOString() });
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        Your Notifications
                    </h1>
                    <p className="text-slate-600 mt-1">A complete history of all alerts sent to you.</p>
                </div>
                <Button onClick={handleMarkAllRead}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark All as Read
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-end">
                         <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Notifications</SelectItem>
                                <SelectItem value="unread">Unread Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="space-y-3">
                            {filteredNotifications.map(n => <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkAsRead} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                            <Bell className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-4 text-lg font-medium text-slate-800">All caught up!</h3>
                            <p className="mt-1 text-sm text-slate-500">You have no notifications here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

const NotificationItem = ({ notification, onMarkRead }) => {
    const SeverityIcon = severityConfig[notification.severity]?.icon || Shield;
    const severityColor = severityConfig[notification.severity]?.color || 'text-slate-500';
    const severityBg = severityConfig[notification.severity]?.bg || 'bg-slate-50';

    return (
        <div className={`p-4 rounded-lg flex items-start gap-4 transition-all ${notification.is_read ? 'bg-white' : `${severityBg} border`}`}>
            {!notification.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>}
            <SeverityIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${severityColor}`} />
            <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{notification.title}</h4>
                <p className="text-sm text-slate-600">{notification.description}</p>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                </p>
            </div>
            {!notification.is_read && (
                <Button variant="ghost" size="sm" onClick={() => onMarkRead(notification.id)}>Mark as read</Button>
            )}
        </div>
    );
};