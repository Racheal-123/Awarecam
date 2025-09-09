import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download, 
  RefreshCw, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  BarChart3
} from 'lucide-react';
import { AlertNotification } from '@/api/entities';
import { Organization } from '@/api/entities';
import { format } from 'date-fns';

const statusConfig = {
  sent: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  skipped: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  pending: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
};

const severityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-100' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-100' },
  low: { color: 'text-slate-600', bg: 'bg-slate-100' },
};

export default function AlertLogViewer() {
  const [notifications, setNotifications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    organization_id: '',
    notification_type: '',
    status: '',
    severity: '',
    search: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadData = async () => {
    try {
      const [orgsData] = await Promise.all([
        Organization.list()
      ]);
      setOrganizations(orgsData);
      await loadNotifications();
      await loadStats();
    } catch (error) {
      console.error("Failed to load alert monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      let query = {};
      
      // Apply filters
      if (filters.organization_id) query.organization_id = filters.organization_id;
      if (filters.notification_type) query.notification_type = filters.notification_type;
      if (filters.status) query.status = filters.status;
      if (filters.severity) query.severity = filters.severity;
      
      const data = await AlertNotification.filter(query, '-created_date', 100);
      
      // Apply search filter client-side
      let filteredData = data;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = data.filter(n => 
          n.title?.toLowerCase().includes(searchTerm) ||
          n.description?.toLowerCase().includes(searchTerm) ||
          n.organization_id?.toLowerCase().includes(searchTerm)
        );
      }
      
      setNotifications(filteredData);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const loadStats = async () => {
    try {
      const allNotifications = await AlertNotification.list();
      
      const statsData = {
        total: allNotifications.length,
        sent: allNotifications.filter(n => n.status === 'sent' || n.status === 'delivered').length,
        failed: allNotifications.filter(n => n.status === 'failed').length,
        pending: allNotifications.filter(n => n.status === 'pending').length,
        skipped: allNotifications.filter(n => n.status === 'skipped').length,
      };
      
      statsData.failureRate = statsData.total > 0 ? Math.round((statsData.failed / statsData.total) * 100) : 0;
      
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Date', 'Organization', 'Type', 'Status', 'Severity', 'Title', 'Description', 'Error'];
      const csvContent = [
        headers.join(','),
        ...notifications.map(n => [
          format(new Date(n.created_date), 'yyyy-MM-dd HH:mm:ss'),
          getOrganizationName(n.organization_id),
          n.notification_type,
          n.status,
          n.severity || '',
          `"${(n.title || '').replace(/"/g, '""')}"`,
          `"${(n.description || '').replace(/"/g, '""')}"`,
          `"${(n.delivery_error || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alert-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || 'Unknown Org';
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-xl font-bold">{stats.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Sent</p>
                <p className="text-xl font-bold text-green-600">{stats.sent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-slate-600">Failed</p>
                <p className="text-xl font-bold text-red-600">{stats.failed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-xl font-bold">{stats.pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600">Skipped</p>
                <p className="text-xl font-bold">{stats.skipped || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-slate-600">Failure Rate</p>
                <p className="text-xl font-bold text-red-600">{stats.failureRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Actions
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search notifications..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Organization</label>
              <Select value={filters.organization_id} onValueChange={(value) => handleFilterChange('organization_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Organizations</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Channel Type</label>
              <Select value={filters.notification_type} onValueChange={(value) => handleFilterChange('notification_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="iot_device">IoT Device</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Delivery Log</CardTitle>
          <CardDescription>Recent notification delivery attempts across all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length > 0 ? notifications.map(notification => {
                  const StatusIcon = statusConfig[notification.status]?.icon || Clock;
                  const SeverityConfig = severityConfig[notification.severity] || {};
                  
                  return (
                    <TableRow key={notification.id}>
                      <TableCell className="text-sm">
                        {format(new Date(notification.created_date), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{getOrganizationName(notification.organization_id)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {notification.notification_type?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[notification.status]?.bg} ${statusConfig[notification.status]?.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.severity && (
                          <Badge className={`${SeverityConfig.bg} ${SeverityConfig.color} border-0 capitalize`}>
                            {notification.severity}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{notification.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.delivery_error && (
                          <span className="text-xs text-red-600 max-w-xs block truncate" title={notification.delivery_error}>
                            {notification.delivery_error}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center py-8 text-slate-500">
                      No alert notifications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}