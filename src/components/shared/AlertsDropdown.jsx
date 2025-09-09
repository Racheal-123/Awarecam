import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { AlertNotification } from '@/api/entities';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-600' },
  high: { icon: AlertTriangle, color: 'text-orange-600' },
  medium: { icon: Shield, color: 'text-blue-600' },
  low: { icon: Shield, color: 'text-slate-600' },
};

export default function AlertsDropdown({ notifications, unreadCount, onMarkAsRead }) {

  const handleMarkRead = async (e, notificationId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await AlertNotification.update(notificationId, { is_read: true, read_at: new Date().toISOString() });
      onMarkAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const createAlertsUrl = () => {
    // This helper preserves org_id etc. in the URL
    const params = new URLSearchParams(window.location.search);
    let url = createPageUrl('Alerts');
    if (params.toString()) {
      url += '?' + params.toString();
    }
    return url;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((alert) => {
              const SeverityIcon = severityConfig[alert.severity]?.icon || Shield;
              return (
                <DropdownMenuItem 
                  key={alert.id} 
                  className="p-3 cursor-pointer hover:bg-slate-50 items-start"
                  asChild
                >
                  <Link to={createAlertsUrl()} className="flex items-start gap-3 w-full">
                    <div className={`mt-1 ${severityConfig[alert.severity]?.color}`}>
                      <SeverityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate pr-2">
                        {alert.title}
                      </p>
                      <p className="text-sm text-slate-600 truncate mt-0.5">
                        {alert.description}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-full"
                        onClick={(e) => handleMarkRead(e, alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 text-slate-400 hover:text-green-600" />
                      </Button>
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
            
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="p-3">
          <Link 
            to={createAlertsUrl()} 
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Notifications
            <ExternalLink className="w-4 h-4" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}